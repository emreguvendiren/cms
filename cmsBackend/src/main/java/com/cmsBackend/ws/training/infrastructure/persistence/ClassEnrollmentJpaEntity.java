package com.cmsBackend.ws.training.infrastructure.persistence;

import com.cmsBackend.ws.training.domain.EnrollmentStatus;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "class_enrollments", uniqueConstraints = @UniqueConstraint(name = "uk_class_enrollment_student", columnNames = {"class_id", "student_id"}), indexes = {@Index(name="idx_class_enrollments_class", columnList="class_id"), @Index(name="idx_class_enrollments_student", columnList="student_id")})
public class ClassEnrollmentJpaEntity {
    @Id private UUID id;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="class_id", nullable=false) private CourseClassJpaEntity courseClass;
    @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="student_id", nullable=false) private StudentJpaEntity student;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private EnrollmentStatus status;
    protected ClassEnrollmentJpaEntity() {}
    public ClassEnrollmentJpaEntity(UUID id, CourseClassJpaEntity courseClass, StudentJpaEntity student, EnrollmentStatus status){this.id=id;this.courseClass=courseClass;this.student=student;this.status=status;}
    public StudentJpaEntity getStudent(){return student;} public EnrollmentStatus getStatus(){return status;}
}
