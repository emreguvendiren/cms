package com.cmsBackend.ws;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.cmsBackend.ws.training.domain.*;
import com.cmsBackend.ws.training.infrastructure.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class TrainingApiIntegrationTests extends IntegrationTestSupport {
    @Autowired MockMvc mvc;
    @Autowired CourseRepository courses;
    @Autowired CourseClassRepository classes;
    @Autowired StudentRepository students;
    @Autowired ClassEnrollmentRepository enrollments;

    @BeforeEach void setUp() { enrollments.deleteAll(); students.deleteAll(); classes.deleteAll(); courses.deleteAll(); }

    @Test void endpointsRequireFineGrainedAuthorities() throws Exception {
        mvc.perform(get("/api/courses")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/courses").with(jwt().authorities(new SimpleGrantedAuthority("class:read")))).andExpect(status().isForbidden());
        mvc.perform(get("/api/courses").with(jwt().authorities(new SimpleGrantedAuthority("course:read")))).andExpect(status().isOk());
        var course=activeCourse();
        mvc.perform(delete("/api/courses/{id}", course.getId()).with(jwt().authorities(new SimpleGrantedAuthority("course:update")))).andExpect(status().isForbidden());
    }

    @Test void createsCourseWithServerGeneratedCodeAndSelectedStatus() throws Exception {
        mvc.perform(post("/api/courses").with(jwt().authorities(new SimpleGrantedAuthority("course:create")))
                        .contentType(MediaType.APPLICATION_JSON).content(courseBody("ACTIVE")))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code", org.hamcrest.Matchers.startsWith("KRS-")))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test void updatesCourseAndRejectsStaleVersion() throws Exception {
        var course=activeCourse(); var auth=jwt().authorities(new SimpleGrantedAuthority("course:update"));
        String body="{\"name\":\"AutoCAD Güncel\",\"category\":\"Teknik Tasarım\",\"durationHours\":56,\"listPrice\":14000,\"status\":\"DRAFT\",\"version\":0}";
        mvc.perform(put("/api/courses/{id}", course.getId()).with(auth).contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk()).andExpect(jsonPath("$.name").value("AutoCAD Güncel"));
        mvc.perform(put("/api/courses/{id}", course.getId()).with(auth).contentType(MediaType.APPLICATION_JSON).content(body)).andExpect(status().isConflict());
    }

    @Test void protectsCourseWithClassesAndDeletesUnreferencedCourse() throws Exception {
        var referenced=activeCourse(); newClass(referenced);
        var auth=jwt().authorities(new SimpleGrantedAuthority("course:delete"));
        mvc.perform(delete("/api/courses/{id}", referenced.getId()).with(auth)).andExpect(status().isConflict());
        var removable=courses.save(new CourseJpaEntity(UUID.randomUUID(), "KRS-002", "CNC", "Üretim", 20, BigDecimal.TEN, CourseStatus.DRAFT));
        mvc.perform(delete("/api/courses/{id}", removable.getId()).with(auth)).andExpect(status().isNoContent());
    }

    @Test void createsAndUpdatesClassWithoutClientCode() throws Exception {
        var course=activeCourse();
        mvc.perform(post("/api/classes").with(jwt().authorities(new SimpleGrantedAuthority("class:create"))).contentType(MediaType.APPLICATION_JSON).content(classBody(course.getId())))
                .andExpect(status().isCreated()).andExpect(jsonPath("$.code", org.hamcrest.Matchers.startsWith("SNF-")));
        var item=newClass(course);
        String update="{\"name\":\"AutoCAD Güncel Sınıf\",\"courseId\":\"%s\",\"instructorName\":\"Murat Aydın\",\"startDate\":\"2026-08-11\",\"endDate\":\"2026-09-03\",\"capacity\":16,\"status\":\"IN_PROGRESS\",\"version\":0}".formatted(course.getId());
        mvc.perform(put("/api/classes/{id}", item.getId()).with(jwt().authorities(new SimpleGrantedAuthority("class:update"))).contentType(MediaType.APPLICATION_JSON).content(update))
                .andExpect(status().isOk()).andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test void returnsClassDetailStudentsAndProtectsEnrolledClassFromDeletion() throws Exception {
        var item=newClass(activeCourse());
        var student=students.save(new StudentJpaEntity(UUID.randomUUID(), "Deniz Arslan", "deniz@example.com", "05550000000"));
        enrollments.save(new ClassEnrollmentJpaEntity(UUID.randomUUID(), item, student, EnrollmentStatus.ACTIVE));
        mvc.perform(get("/api/classes/{id}", item.getId()).with(jwt().authorities(new SimpleGrantedAuthority("class:read"))))
                .andExpect(status().isOk()).andExpect(jsonPath("$.students[0].fullName").value("Deniz Arslan"))
                .andExpect(jsonPath("$.classInfo.enrolledCount").value(1));
        mvc.perform(delete("/api/classes/{id}", item.getId()).with(jwt().authorities(new SimpleGrantedAuthority("class:delete")))).andExpect(status().isConflict());
    }

    @Test void validatesClassDateRangeAndReferencedCourse() throws Exception {
        var course=activeCourse(); var auth=jwt().authorities(new SimpleGrantedAuthority("class:create"));
        String invalid=classBody(course.getId()).replace("2026-08-10", "2026-10-10");
        mvc.perform(post("/api/classes").with(auth).contentType(MediaType.APPLICATION_JSON).content(invalid)).andExpect(status().isBadRequest());
        mvc.perform(post("/api/classes").with(auth).contentType(MediaType.APPLICATION_JSON).content(classBody(UUID.randomUUID()))).andExpect(status().isNotFound());
    }

    private CourseJpaEntity activeCourse(){return courses.save(new CourseJpaEntity(UUID.randomUUID(), "KRS-001", "AutoCAD 2D Teknik Çizim", "Teknik Tasarım", 48, new BigDecimal("12500"), CourseStatus.ACTIVE));}
    private CourseClassJpaEntity newClass(CourseJpaEntity course){return classes.save(new CourseClassJpaEntity(UUID.randomUUID(), "SNF-TEST", "AutoCAD Akşam", course, "Murat Aydın", LocalDate.parse("2026-08-10"), LocalDate.parse("2026-09-02"), 14, ClassStatus.PLANNED));}
    private String courseBody(String status){return "{\"name\":\"AutoCAD 2D Teknik Çizim\",\"category\":\"Teknik Tasarım\",\"durationHours\":48,\"listPrice\":12500,\"status\":\"%s\"}".formatted(status);}
    private String classBody(UUID courseId){return "{\"name\":\"AutoCAD Hafta İçi Akşam\",\"courseId\":\"%s\",\"instructorName\":\"Murat Aydın\",\"startDate\":\"2026-08-10\",\"endDate\":\"2026-09-02\",\"capacity\":14,\"status\":\"PLANNED\"}".formatted(courseId);}
}
