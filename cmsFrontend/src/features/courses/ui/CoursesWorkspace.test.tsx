import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppProviders } from "../../../app/providers/AppProviders";
import { CoursesWorkspace } from "./CoursesWorkspace";

const api = vi.hoisted(() => ({ loadCourses: vi.fn(), loadClasses: vi.fn(), loadClassDetail: vi.fn(), createCourse: vi.fn(), createClass: vi.fn(), updateCourse: vi.fn(), updateClass: vi.fn(), removeCourse: vi.fn(), removeClass: vi.fn() }));
vi.mock("../api/trainingApi", () => api);

const admin = { id: "admin", email: "admin@admin.com", authorities: ["course:create", "course:update", "course:delete", "class:create", "class:update", "class:delete"] };
const course = { id: "56d11b06-09d2-4fdf-a286-35f499c4fd50", code: "KRS-001", name: "AutoCAD 2D Teknik Çizim", category: "Teknik Tasarım", durationHours: 48, listPrice: 12500, status: "ACTIVE", version: 0 };
const courseClass = { id: "50286120-df69-49c8-b803-5dfdd9a98287", code: "SNF-041", name: "AutoCAD Hafta İçi Akşam", courseId: course.id, courseCode: course.code, courseName: course.name, instructorName: "Murat Aydın", startDate: "2026-08-10", endDate: "2026-09-02", capacity: 14, enrolledCount: 1, status: "ENROLLMENT_OPEN", version: 0 };
const page = <T,>(content: T[]) => ({ content, page: 0, size: 8, totalElements: content.length, totalPages: content.length ? 1 : 0, first: true, last: true });

beforeEach(() => {
  api.loadCourses.mockResolvedValue(page([course])); api.loadClasses.mockResolvedValue(page([courseClass]));
  api.loadClassDetail.mockResolvedValue({ classInfo: courseClass, students: [{ id: "student-1", fullName: "Deniz Arslan", email: "deniz@example.com", phone: "05550000000", enrollmentStatus: "ACTIVE" }] });
  api.createCourse.mockResolvedValue(undefined); api.createClass.mockResolvedValue(undefined); api.updateCourse.mockResolvedValue(undefined); api.updateClass.mockResolvedValue(undefined); api.removeCourse.mockResolvedValue(undefined); api.removeClass.mockResolvedValue(undefined);
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
function renderWorkspace() { render(<AppProviders><CoursesWorkspace user={admin} /></AppProviders>); }

describe("CoursesWorkspace", () => {
  it("kurs oluşturma formunda kod istemez ve durum seçtirir", async () => {
    const user = userEvent.setup(); renderWorkspace();
    expect(await screen.findByText(course.name)).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Yeni kurs/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByLabelText("Kurs kodu")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Durum")).toBeInTheDocument();
  });

  it("kurs düzenleme aksiyonunu gerçek endpoint wrapperına bağlar", async () => {
    const user = userEvent.setup(); renderWorkspace(); await screen.findByText(course.name);
    await user.click(screen.getByRole("button", { name: "Düzenle" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("kaydını düzenle");
    expect(within(dialog).getByDisplayValue(course.name)).toBeInTheDocument();
  });

  it("sınıf satırından detay ve kayıtlı öğrencileri açar", async () => {
    const user = userEvent.setup(); renderWorkspace(); await user.click(screen.getByRole("tab", { name: /Sınıflar/ }));
    const className = await screen.findByText(courseClass.name); await user.click(className);
    expect(await screen.findByText("Deniz Arslan")).toBeInTheDocument();
    expect(screen.getByText("Kayıtlı öğrenciler")).toBeInTheDocument();
    expect(api.loadClassDetail).toHaveBeenCalledWith(courseClass.id);
  });

  it("sınıf formunda kod ve ders programı yerine tarih aralığı kullanır", async () => {
    const user = userEvent.setup(); renderWorkspace(); await user.click(screen.getByRole("tab", { name: /Sınıflar/ })); await user.click(screen.getByRole("button", { name: /Yeni sınıf/ }));
    const dialog = screen.getByRole("dialog");
    expect(within(dialog).queryByLabelText("Sınıf kodu")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Başlangıç ve bitiş tarihi")).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Ders programı")).not.toBeInTheDocument();
  });
});
