import { getAccessToken } from "../../auth";
import { environment } from "../../../shared/config/environment";
import {
  createClass as createClassRequest,
  createCourse as createCourseRequest,
  updateCourse as updateCourseRequest,
  deleteCourse as deleteCourseRequest,
  updateClass as updateClassRequest,
  deleteClass as deleteClassRequest,
  getClassDetail as getClassDetailRequest,
  listClasses as listClassesRequest,
  listCourses as listCoursesRequest,
  type ClassPage,
  type ClassStatus,
  type CoursePage,
  type CourseStatus,
  type CreateClassRequest,
  type CreateCourseRequest,
  type UpdateCourseRequest,
  type UpdateClassRequest,
  type ClassDetail,
} from "../../../shared/api/generated";

type ListCoursesParameters = {
  search: string;
  status?: CourseStatus;
  page: number;
  size: number;
};

type ListClassesParameters = {
  search: string;
  status?: ClassStatus;
  page: number;
  size: number;
};

function clientOptions() {
  return {
    auth: getAccessToken() ?? undefined,
    baseUrl: environment.apiBaseUrl,
    credentials: "include" as const,
    throwOnError: true as const,
  };
}

export async function loadCourses(parameters: ListCoursesParameters): Promise<CoursePage> {
  const response = await listCoursesRequest({ ...clientOptions(), query: parameters });
  return response.data;
}

export async function loadClasses(parameters: ListClassesParameters): Promise<ClassPage> {
  const response = await listClassesRequest({ ...clientOptions(), query: parameters });
  return response.data;
}

export async function createCourse(request: CreateCourseRequest): Promise<void> {
  await createCourseRequest({ ...clientOptions(), body: request });
}

export async function createClass(request: CreateClassRequest): Promise<void> {
  await createClassRequest({ ...clientOptions(), body: request });
}

export async function updateCourse(id: string, request: UpdateCourseRequest): Promise<void> {
  await updateCourseRequest({ ...clientOptions(), path: { courseId: id }, body: request });
}
export async function removeCourse(id: string): Promise<void> {
  await deleteCourseRequest({ ...clientOptions(), path: { courseId: id } });
}
export async function updateClass(id: string, request: UpdateClassRequest): Promise<void> {
  await updateClassRequest({ ...clientOptions(), path: { classId: id }, body: request });
}
export async function removeClass(id: string): Promise<void> {
  await deleteClassRequest({ ...clientOptions(), path: { classId: id } });
}
export async function loadClassDetail(id: string): Promise<ClassDetail> {
  return (await getClassDetailRequest({ ...clientOptions(), path: { classId: id } })).data;
}

export type {
  ClassPage,
  ClassStatus,
  Course,
  CourseClass,
  CoursePage,
  CourseStatus,
  CreateClassRequest,
  CreateCourseRequest,
  UpdateCourseRequest,
  UpdateClassRequest,
  ClassDetail,
} from "../../../shared/api/generated";
