package com.cmsBackend.ws.training.api.model;

import com.cmsBackend.ws.training.domain.EnrollmentStatus;
import com.cmsBackend.ws.training.infrastructure.persistence.ClassEnrollmentJpaEntity;
import java.util.*;

public record ClassDetailResponse(ClassResponse classInfo, List<EnrolledStudentResponse> students) {
    public record EnrolledStudentResponse(UUID id, String fullName, String email, String phoneMasked, EnrollmentStatus enrollmentStatus) {
        public static EnrolledStudentResponse from(ClassEnrollmentJpaEntity enrollment) {
            var student=enrollment.getStudent();
            return new EnrolledStudentResponse(student.getId(), student.getFullName(), student.getEmail(), "••• ••• •• ••", enrollment.getStatus());
        }
    }
}
