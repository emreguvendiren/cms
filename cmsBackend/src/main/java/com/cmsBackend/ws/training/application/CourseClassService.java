package com.cmsBackend.ws.training.application;

import com.cmsBackend.ws.training.api.model.ClassResponse;
import com.cmsBackend.ws.training.api.model.CreateClassRequest;
import com.cmsBackend.ws.training.api.model.UpdateClassRequest;
import com.cmsBackend.ws.training.api.model.ClassDetailResponse;
import com.cmsBackend.ws.training.api.model.PageResponse;
import com.cmsBackend.ws.training.domain.ClassStatus;
import com.cmsBackend.ws.training.domain.CourseStatus;
import com.cmsBackend.ws.training.infrastructure.persistence.CourseClassJpaEntity;
import com.cmsBackend.ws.training.infrastructure.persistence.CourseClassRepository;
import com.cmsBackend.ws.training.infrastructure.persistence.CourseRepository;
import com.cmsBackend.ws.training.infrastructure.persistence.ClassEnrollmentRepository;
import java.util.UUID;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CourseClassService {
    private final CourseClassRepository classes;
    private final CourseRepository courses;
    private final ClassEnrollmentRepository enrollments;

    public CourseClassService(CourseClassRepository classes, CourseRepository courses, ClassEnrollmentRepository enrollments) {
        this.classes = classes;
        this.courses = courses;
        this.enrollments = enrollments;
    }

    @PreAuthorize("hasAuthority('class:read')")
    @Transactional(readOnly = true)
    public PageResponse<ClassResponse> list(String search, ClassStatus status, UUID courseId, int page, int size) {
        var pageable = PageRequest.of(page, size, Sort.by("name").ascending().and(Sort.by("id").ascending()));
        return PageResponse.from(
                classes.search(normalizeSearch(search), status, courseId, pageable).map(ClassResponse::from));
    }

    @PreAuthorize("hasAuthority('class:create')")
    @Transactional
    public ClassResponse create(CreateClassRequest request) {
        if (request.endDate().isBefore(request.startDate())) throw new IllegalArgumentException("Invalid date range.");
        UUID id = UUID.randomUUID();
        String code = "SNF-" + id.toString().substring(0, 8).toUpperCase(java.util.Locale.ROOT);
        var course = courses.findById(request.courseId()).orElseThrow(TrainingNotFoundException::new);
        if (course.getStatus() == CourseStatus.ARCHIVED) throw new TrainingConflictException();
        var courseClass = new CourseClassJpaEntity(
                id, code, request.name().trim(), course, request.instructorName().trim(),
                request.startDate(), request.endDate(), request.capacity(), request.status());
        return ClassResponse.from(classes.save(courseClass));
    }

    @PreAuthorize("hasAuthority('class:read')")
    @Transactional(readOnly = true)
    public ClassDetailResponse detail(UUID id) {
        var courseClass = classes.findById(id).orElseThrow(TrainingNotFoundException::new);
        var students = enrollments.findByCourseClassIdOrderByStudentFullNameAsc(id).stream()
                .map(ClassDetailResponse.EnrolledStudentResponse::from).toList();
        return new ClassDetailResponse(ClassResponse.from(courseClass), students);
    }

    @PreAuthorize("hasAuthority('class:update')")
    @Transactional
    public ClassResponse update(UUID id, UpdateClassRequest request) {
        if (request.endDate().isBefore(request.startDate())) throw new IllegalArgumentException("Invalid date range.");
        var courseClass = classes.findById(id).orElseThrow(TrainingNotFoundException::new);
        if (courseClass.getVersion() != request.version()) throw new TrainingConflictException();
        var course = courses.findById(request.courseId()).orElseThrow(TrainingNotFoundException::new);
        if (course.getStatus() == CourseStatus.ARCHIVED) throw new TrainingConflictException();
        if (request.capacity() < courseClass.getEnrolledCount()) throw new TrainingConflictException();
        courseClass.update(request.name().trim(), course, request.instructorName().trim(), request.startDate(), request.endDate(), request.capacity(), request.status());
        return ClassResponse.from(classes.saveAndFlush(courseClass));
    }

    @PreAuthorize("hasAuthority('class:delete')")
    @Transactional
    public void delete(UUID id) {
        if (!classes.existsById(id)) throw new TrainingNotFoundException();
        if (enrollments.existsByCourseClassId(id)) throw new TrainingConflictException();
        classes.deleteById(id);
    }

    private String normalizeSearch(String search) {
        return search == null ? "" : search.trim();
    }
}
