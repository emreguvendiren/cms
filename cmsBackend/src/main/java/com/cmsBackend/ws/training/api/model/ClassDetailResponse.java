package com.cmsBackend.ws.training.api.model;

import com.cmsBackend.ws.training.domain.EnrollmentStatus;
import com.cmsBackend.ws.training.domain.PaymentPlanType;
import com.cmsBackend.ws.training.domain.PaymentStatus;
import com.cmsBackend.ws.training.infrastructure.persistence.ClassEnrollmentJpaEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

public record ClassDetailResponse(ClassResponse classInfo, List<EnrolledStudentResponse> students) {
    public record EnrolledStudentResponse(UUID id, UUID enrollmentId, String fullName, String email, String phoneMasked,
            EnrollmentStatus enrollmentStatus, BigDecimal registrationFee, PaymentPlanType paymentPlan,
            Integer installmentCount, LocalDate firstPaymentDate, PaymentStatus paymentStatus,
            LocalDate expectedPaymentDate, String note, long version) {
        public static EnrolledStudentResponse from(ClassEnrollmentJpaEntity enrollment) {
            var student=enrollment.getStudent();
            return new EnrolledStudentResponse(student.getId(), enrollment.getId(), student.getFullName(), student.getEmail(),
                    "••• ••• •• ••", enrollment.getStatus(), enrollment.getRegistrationFee(),
                    enrollment.getPaymentPlan(), enrollment.getInstallmentCount(), enrollment.getFirstPaymentDate(),
                    enrollment.getPaymentStatus(), enrollment.getExpectedPaymentDate(), enrollment.getNote(),
                    enrollment.getVersion());
        }
    }
}
