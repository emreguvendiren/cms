import type { JSX } from "react";
import { useEffect, useState } from "react";
import BookOutlined from "@ant-design/icons/BookOutlined";
import CalendarOutlined from "@ant-design/icons/CalendarOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import { Alert, App, Button, DatePicker, Descriptions, Empty, Flex, Form, Grid, Input, InputNumber, Modal, Pagination, Progress, Select, Space, Table, Tabs, Tag, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import type { AuthenticatedUser } from "../../auth";
import {
  createClass, createCourse, loadClassDetail, loadClasses, loadCourses, removeClass, removeCourse, updateClass, updateCourse,
  type ClassDetail, type ClassPage, type ClassStatus, type Course, type CourseClass, type CoursePage, type CourseStatus,
  type CreateClassRequest, type CreateCourseRequest,
} from "../api/trainingApi";
import "./coursesWorkspace.css";

type WorkspaceTab = "courses" | "classes";
type RemotePage<T> = { status: "loading" } | { status: "error" } | { status: "success"; page: T };
type CourseFormValues = Omit<CreateCourseRequest, never>;
type ClassFormValues = Omit<CreateClassRequest, "startDate" | "endDate"> & { dateRange: [Dayjs, Dayjs] };
type EditingRecord = { type: "course"; value: Course } | { type: "class"; value: CourseClass };

const PAGE_SIZE = 8;
const currency = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const courseStatusLabels: Record<CourseStatus, string> = { ACTIVE: "Aktif", DRAFT: "Taslak", ARCHIVED: "Arşivlendi" };
const classStatusLabels: Record<ClassStatus, string> = { ENROLLMENT_OPEN: "Kayıt açık", PLANNED: "Planlandı", IN_PROGRESS: "Devam ediyor", COMPLETED: "Tamamlandı" };
const enrollmentLabels: Record<string, string> = { ACTIVE: "Aktif kayıt", COMPLETED: "Tamamladı", CANCELLED: "İptal edildi" };

export function CoursesWorkspace({ user }: { user: AuthenticatedUser }): JSX.Element {
  const { message, modal } = App.useApp();
  const screens = Grid.useBreakpoint();
  const [tab, setTab] = useState<WorkspaceTab>("courses");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<CourseStatus | ClassStatus | "all">("all");
  const [pageNumber, setPageNumber] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<EditingRecord>();
  const [submitting, setSubmitting] = useState(false);
  const [coursesState, setCoursesState] = useState<RemotePage<CoursePage>>({ status: "loading" });
  const [classesState, setClassesState] = useState<RemotePage<ClassPage>>({ status: "loading" });
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<ClassDetail>();
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(false);
  const [detailTarget, setDetailTarget] = useState<CourseClass>();
  const [form] = Form.useForm<CourseFormValues | ClassFormValues>();
  const can = (authority: string) => user.authorities.includes(authority);

  useEffect(() => {
    let active = true;
    void loadCourses({ search: "", page: 0, size: 100 }).then((result) => { if (active) setCourseOptions(result.content); }).catch(() => undefined);
    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    let active = true;
    const id = window.setTimeout(() => {
      if (tab === "courses") {
        setCoursesState({ status: "loading" });
        void loadCourses({ search: query, status: status === "all" ? undefined : status as CourseStatus, page: pageNumber, size: PAGE_SIZE })
          .then((page) => { if (active) setCoursesState({ status: "success", page }); }).catch(() => { if (active) setCoursesState({ status: "error" }); });
      } else {
        setClassesState({ status: "loading" });
        void loadClasses({ search: query, status: status === "all" ? undefined : status as ClassStatus, page: pageNumber, size: PAGE_SIZE })
          .then((page) => { if (active) setClassesState({ status: "success", page }); }).catch(() => { if (active) setClassesState({ status: "error" }); });
      }
    }, 300);
    return () => { active = false; window.clearTimeout(id); };
  }, [tab, query, status, pageNumber, reloadKey]);

  const resetFilters = () => { setQuery(""); setStatus("all"); setPageNumber(0); };
  const openCreate = () => { setEditing(undefined); form.resetFields(); form.setFieldsValue(tab === "courses" ? { status: "ACTIVE" } : { status: "PLANNED" }); setFormOpen(true); };
  const openEditCourse = (course: Course) => { setEditing({ type: "course", value: course }); form.setFieldsValue({ name: course.name, category: course.category, durationHours: course.durationHours, listPrice: course.listPrice, status: course.status }); setFormOpen(true); };
  const openEditClass = (item: CourseClass) => { setEditing({ type: "class", value: item }); form.setFieldsValue({ name: item.name, courseId: item.courseId, instructorName: item.instructorName, capacity: item.capacity, status: item.status, dateRange: [dayjs(item.startDate), dayjs(item.endDate)] }); setFormOpen(true); };

  const submit = async () => {
    const values = await form.validateFields(); setSubmitting(true);
    try {
      if (tab === "courses") {
        const request = values as CourseFormValues;
        if (editing?.type === "course") await updateCourse(editing.value.id, { ...request, version: editing.value.version }); else await createCourse(request);
        message.success(editing ? "Kurs bilgileri güncellendi." : "Kurs oluşturuldu.");
      } else {
        const value = values as ClassFormValues;
        const request = { name: value.name, courseId: value.courseId, instructorName: value.instructorName, capacity: value.capacity, status: value.status, startDate: value.dateRange[0].format("YYYY-MM-DD"), endDate: value.dateRange[1].format("YYYY-MM-DD") };
        if (editing?.type === "class") await updateClass(editing.value.id, { ...request, version: editing.value.version }); else await createClass(request);
        message.success(editing ? "Sınıf bilgileri güncellendi." : "Sınıf planlandı.");
      }
      setFormOpen(false); form.resetFields(); setPageNumber(0); setReloadKey((value) => value + 1);
    } catch (error) { if (!(error && typeof error === "object" && "errorFields" in error)) message.error("Kayıt güncellenemedi. Bilgileri kontrol edip tekrar deneyin."); }
    finally { setSubmitting(false); }
  };

  const confirmDelete = (type: "course" | "class", record: Course | CourseClass) => {
    modal.confirm({ centered: true, title: `${record.name} silinsin mi?`, content: type === "course" ? "Bağlı sınıfı bulunan kurslar silinemez." : "Kayıtlı öğrencisi bulunan sınıflar silinemez.", okText: "Kalıcı olarak sil", okType: "danger", cancelText: "Vazgeç",
      onOk: async () => { try { if (type === "course") await removeCourse(record.id); else await removeClass(record.id); message.success(`${type === "course" ? "Kurs" : "Sınıf"} silindi.`); setReloadKey((value) => value + 1); } catch { message.error("Kayıt silinemedi. Bağlı kayıtları kontrol edin."); } },
    });
  };

  const openDetail = async (item: CourseClass) => {
    setDetailTarget(item);
    setDetailOpen(true); setDetail(undefined); setDetailError(false); setDetailLoading(true);
    try { setDetail(await loadClassDetail(item.id)); } catch { setDetailError(true); } finally { setDetailLoading(false); }
  };

  const state = tab === "courses" ? coursesState : classesState;
  const currentPage = state.status === "success" ? state.page : undefined;
  const allowCreate = can(tab === "courses" ? "course:create" : "class:create");
  const modalTitle = editing ? `${editing.value.name} kaydını düzenle` : tab === "courses" ? "Yeni kurs oluştur" : "Yeni sınıf planla";

  return <div className="courses">
    <div className="courses__heading"><div><Typography.Text className="courses__eyebrow">EĞİTİM PORTFÖYÜ</Typography.Text><Typography.Title>Kurslar ve sınıflar</Typography.Title><Typography.Paragraph>Kurs portföyünü, dönem sınıflarını ve öğrenci doluluklarını tek yerden yönetin.</Typography.Paragraph></div>{allowCreate && <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>Yeni {tab === "courses" ? "kurs" : "sınıf"}</Button>}</div>
    <Tabs activeKey={tab} onChange={(key) => { setTab(key as WorkspaceTab); resetFilters(); }} items={[{ key: "courses", label: <span><BookOutlined /> Kurslar {coursesState.status === "success" && <b>{coursesState.page.totalElements}</b>}</span> }, { key: "classes", label: <span><CalendarOutlined /> Sınıflar {classesState.status === "success" && <b>{classesState.page.totalElements}</b>}</span> }]} />
    <div className="courses__toolbar"><Input aria-label="Kayıtlarda ara" prefix={<SearchOutlined />} placeholder={`${tab === "courses" ? "Kurs" : "Sınıf"} ara`} value={query} onChange={(event) => { setQuery(event.target.value); setPageNumber(0); }} allowClear/><Select aria-label="Duruma göre filtrele" value={status} onChange={(value) => { setStatus(value); setPageNumber(0); }} options={statusOptions(tab)} /></div>
    {state.status === "error" && <Alert type="error" showIcon message="Kayıtlar yüklenemedi" description="Bağlantıyı kontrol edip tekrar deneyin." action={<Button onClick={() => setReloadKey((value) => value + 1)}>Tekrar dene</Button>} />}
    {state.status === "loading" && <div className="courses__loading">Kayıtlar yükleniyor…</div>}
    {currentPage && <Records tab={tab} page={currentPage} mobile={!screens.md} hasFilters={query !== "" || status !== "all"} can={can} onCreate={openCreate} onClear={resetFilters} onPageChange={(value) => setPageNumber(value - 1)} onEditCourse={openEditCourse} onEditClass={openEditClass} onDelete={confirmDelete} onClassDetail={(item) => void openDetail(item)} />}
    <Modal centered open={formOpen} title={modalTitle} okText={editing ? "Değişiklikleri kaydet" : tab === "courses" ? "Kursu oluştur" : "Sınıfı planla"} cancelText="Vazgeç" confirmLoading={submitting} closable={!submitting} mask={{ closable: !submitting }} onCancel={() => setFormOpen(false)} onOk={() => void submit()}>{tab === "courses" ? <CourseForm form={form} /> : <ClassForm form={form} courses={courseOptions.filter((course) => course.status !== "ARCHIVED")} />}</Modal>
    <ClassDetailModal open={detailOpen} loading={detailLoading} error={detailError} detail={detail} onClose={() => setDetailOpen(false)} onRetry={() => { if (detailTarget) void openDetail(detailTarget); }} />
  </div>;
}

type RecordsProps = { tab: WorkspaceTab; page: CoursePage | ClassPage; mobile: boolean; hasFilters: boolean; can: (authority: string) => boolean; onCreate: () => void; onClear: () => void; onPageChange: (page: number) => void; onEditCourse: (record: Course) => void; onEditClass: (record: CourseClass) => void; onDelete: (type: "course" | "class", record: Course | CourseClass) => void; onClassDetail: (record: CourseClass) => void };
function Records(props: RecordsProps): JSX.Element {
  const { tab, page, mobile, hasFilters } = props;
  if (page.content.length === 0) {
    const mayCreate = props.can(tab === "courses" ? "course:create" : "class:create");
    return <Empty description={hasFilters ? "Bu filtrelere uygun kayıt bulunamadı." : `Henüz ${tab === "courses" ? "kurs" : "sınıf"} eklenmedi.`}>{hasFilters ? <Button onClick={props.onClear}>Filtreleri temizle</Button> : mayCreate ? <Button type="primary" onClick={props.onCreate}>İlk kaydı oluştur</Button> : null}</Empty>;
  }
  const courseColumns: ColumnsType<Course> = [
    { title: "Kurs", dataIndex: "name", render: (value, record) => <div className="courses__primary-cell"><strong>{value}</strong><small>{record.category}</small></div> },
    { title: "Süre", dataIndex: "durationHours", render: (value) => `${value} saat` }, { title: "Liste fiyatı", dataIndex: "listPrice", align: "right", render: (value) => currency.format(value) },
    { title: "Durum", dataIndex: "status", render: (value) => <StatusTag value={value} /> },
    { title: "İşlemler", width: 140, render: (_, record) => <RecordActions canUpdate={props.can("course:update")} canDelete={props.can("course:delete")} onEdit={() => props.onEditCourse(record)} onDelete={() => props.onDelete("course", record)} /> },
  ];
  const classColumns: ColumnsType<CourseClass> = [
    { title: "Sınıf", dataIndex: "name", render: (value, record) => <div className="courses__primary-cell"><strong>{value}</strong><small>{record.courseName}</small></div> }, { title: "Eğitmen", dataIndex: "instructorName" },
    { title: "Tarih aralığı", dataIndex: "startDate", render: (value, record) => <div className="courses__primary-cell"><span>{formatApiDate(value)}</span><small>{formatApiDate(record.endDate)} tarihine kadar</small></div> },
    { title: "Doluluk", width: 160, render: (_, record) => <Occupancy item={record} /> }, { title: "Durum", dataIndex: "status", render: (value) => <StatusTag value={value} /> },
    { title: "İşlemler", width: 140, render: (_, record) => <div onClick={(event) => event.stopPropagation()}><RecordActions canUpdate={props.can("class:update")} canDelete={props.can("class:delete")} onEdit={() => props.onEditClass(record)} onDelete={() => props.onDelete("class", record)} /></div> },
  ];
  return <>{mobile ? <div className="courses__mobile-list">{tab === "courses" ? (page as CoursePage).content.map((item) => <CourseCard key={item.id} item={item} {...props} />) : (page as ClassPage).content.map((item) => <ClassCard key={item.id} item={item} {...props} />)}</div> : tab === "courses" ? <Table rowKey="id" columns={courseColumns} dataSource={(page as CoursePage).content} pagination={false} /> : <Table rowKey="id" columns={classColumns} dataSource={(page as ClassPage).content} pagination={false} onRow={(record) => ({ tabIndex: 0, className: "courses__clickable-row", onClick: () => props.onClassDetail(record), onKeyDown: (event) => { if (event.key === "Enter" || event.key === " ") props.onClassDetail(record); } })} />}{page.totalElements > page.size && <Pagination className="courses__pagination" current={page.page + 1} pageSize={page.size} total={page.totalElements} showSizeChanger={false} onChange={props.onPageChange} />}</>;
}

function CourseForm({ form }: { form: ReturnType<typeof Form.useForm<CourseFormValues | ClassFormValues>>[0] }): JSX.Element { return <Form form={form} layout="vertical" requiredMark="optional"><Form.Item name="name" label="Kurs adı" rules={[{ required: true, message: "Kurs adını yazın." }, { min: 3, message: "Kurs adı en az 3 karakter olmalıdır." }]}><Input maxLength={160} /></Form.Item><Form.Item name="category" label="Kategori" rules={[{ required: true, message: "Bir kategori seçin." }]}><Select options={["Teknik Tasarım", "3B Modelleme", "Üretim", "Görselleştirme"].map((value) => ({ value, label: value }))} /></Form.Item><Space className="courses__form-row" size={16} align="start"><Form.Item name="durationHours" label="Toplam süre (saat)" rules={[{ required: true, message: "Süreyi yazın." }]}><InputNumber min={1} max={500} /></Form.Item><Form.Item name="listPrice" label="Liste fiyatı (₺)" rules={[{ required: true, message: "Liste fiyatını yazın." }]}><InputNumber min={0} step={500} /></Form.Item></Space><Form.Item name="status" label="Durum" rules={[{ required: true }]}><Select options={Object.entries(courseStatusLabels).map(([value, label]) => ({ value, label }))} /></Form.Item></Form>; }
function ClassForm({ form, courses }: { form: ReturnType<typeof Form.useForm<CourseFormValues | ClassFormValues>>[0]; courses: Course[] }): JSX.Element { return <Form form={form} layout="vertical" requiredMark="optional"><Form.Item name="name" label="Sınıf adı" rules={[{ required: true, message: "Sınıf adını yazın." }]}><Input maxLength={160} /></Form.Item><Form.Item name="courseId" label="Kurs" rules={[{ required: true, message: "Bağlı kursu seçin." }]}><Select showSearch optionFilterProp="label" options={courses.map((course) => ({ value: course.id, label: course.name }))} /></Form.Item><Form.Item name="instructorName" label="Eğitmen" rules={[{ required: true, message: "Eğitmen adını yazın." }]}><Input maxLength={120} /></Form.Item><Form.Item name="dateRange" label="Başlangıç ve bitiş tarihi" rules={[{ required: true, message: "Başlangıç ve bitiş tarihlerini seçin." }]}><DatePicker.RangePicker className="courses__date-picker" format="DD MMMM YYYY" /></Form.Item><Space className="courses__form-row" size={16} align="start"><Form.Item name="capacity" label="Kontenjan" rules={[{ required: true, message: "Kontenjanı yazın." }]}><InputNumber min={1} max={50} /></Form.Item><Form.Item name="status" label="Durum" rules={[{ required: true }]}><Select options={Object.entries(classStatusLabels).map(([value, label]) => ({ value, label }))} /></Form.Item></Space></Form>; }

function ClassDetailModal({ open, loading, error, detail, onClose, onRetry }: { open: boolean; loading: boolean; error: boolean; detail?: ClassDetail; onClose: () => void; onRetry: () => void }): JSX.Element { const info=detail?.classInfo; return <Modal centered width={920} open={open} title={info?.name ?? "Sınıf detayları"} footer={<Button onClick={onClose}>Kapat</Button>} onCancel={onClose}><div className="courses__detail">{loading && <div className="courses__loading">Sınıf bilgileri yükleniyor…</div>}{error && <Alert type="error" showIcon message="Sınıf bilgileri yüklenemedi" action={<Button onClick={onRetry}>Tekrar dene</Button>} />}{info && <><Descriptions bordered size="small" column={{ xs: 1, sm: 2 }} items={[{ key: "course", label: "Kurs", children: info.courseName }, { key: "teacher", label: "Eğitmen", children: info.instructorName }, { key: "dates", label: "Tarih", children: `${formatApiDate(info.startDate)} – ${formatApiDate(info.endDate)}` }, { key: "capacity", label: "Doluluk", children: `${info.enrolledCount}/${info.capacity} öğrenci` }, { key: "status", label: "Durum", children: <StatusTag value={info.status} /> }]} /><div><Typography.Title level={4}>Kayıtlı öğrenciler</Typography.Title><Typography.Text type="secondary">Bu sınıfa kayıtlı {detail.students.length} öğrenci bulunuyor.</Typography.Text></div><Table rowKey="id" size="small" dataSource={detail.students} pagination={false} locale={{ emptyText: <Empty description="Bu sınıfa henüz öğrenci kaydedilmedi." /> }} columns={[{ title: "Öğrenci", dataIndex: "fullName" }, { title: "E-posta", dataIndex: "email" }, { title: "Telefon", dataIndex: "phone", render: (value) => value || "-" }, { title: "Kayıt durumu", dataIndex: "enrollmentStatus", render: (value) => <Tag>{enrollmentLabels[value] ?? value}</Tag> }]} /></>}</div></Modal>; }
function CourseCard({ item, can, onEditCourse, onDelete }: { item: Course } & RecordsProps): JSX.Element { return <article className="courses__mobile-card"><Flex justify="space-between" gap={12}><div><strong>{item.name}</strong><small>{item.category}</small></div><StatusTag value={item.status}/></Flex><Flex justify="space-between"><span>{item.durationHours} saat</span><b>{currency.format(item.listPrice)}</b></Flex><RecordActions canUpdate={can("course:update")} canDelete={can("course:delete")} onEdit={() => onEditCourse(item)} onDelete={() => onDelete("course", item)} /></article>; }
function ClassCard({ item, can, onEditClass, onDelete, onClassDetail }: { item: CourseClass } & RecordsProps): JSX.Element { return <article className="courses__mobile-card"><button className="courses__card-main" onClick={() => onClassDetail(item)}><Flex justify="space-between" gap={12}><div><strong>{item.name}</strong><small>{item.courseName}</small></div><StatusTag value={item.status}/></Flex><div className="courses__class-meta"><span>{item.instructorName}</span><span>{formatApiDate(item.startDate)} – {formatApiDate(item.endDate)}</span></div><Occupancy item={item}/></button><RecordActions canUpdate={can("class:update")} canDelete={can("class:delete")} onEdit={() => onEditClass(item)} onDelete={() => onDelete("class", item)} /></article>; }
function RecordActions({ canUpdate, canDelete, onEdit, onDelete }: { canUpdate: boolean; canDelete: boolean; onEdit: () => void; onDelete: () => void }): JSX.Element | null {
  if (!canUpdate && !canDelete) return null;
  return <Space size={8}>{canUpdate && <Tooltip title="Düzenle"><Button aria-label="Düzenle" icon={<EditOutlined />} onClick={onEdit} /></Tooltip>}{canDelete && <Tooltip title="Sil"><Button aria-label="Sil" danger icon={<DeleteOutlined />} onClick={onDelete} /></Tooltip>}</Space>;
}
function Occupancy({ item }: { item: CourseClass }): JSX.Element { return <div className="courses__occupancy"><span>{item.enrolledCount}/{item.capacity} öğrenci</span><Progress percent={Math.round(item.enrolledCount / item.capacity * 100)} showInfo={false} size="small" /></div>; }
function statusOptions(tab: WorkspaceTab) { const values=tab === "courses" ? courseStatusLabels : classStatusLabels; return [{ value: "all", label: "Tüm durumlar" }, ...Object.entries(values).map(([value,label]) => ({ value,label }))]; }
function formatApiDate(value: string): string { return dateFormatter.format(new Date(`${value}T00:00:00Z`)); }
function StatusTag({ value }: { value: CourseStatus | ClassStatus }): JSX.Element { const label=value in courseStatusLabels ? courseStatusLabels[value as CourseStatus] : classStatusLabels[value as ClassStatus]; const color=value === "ACTIVE" || value === "ENROLLMENT_OPEN" ? "success" : value === "IN_PROGRESS" ? "processing" : value === "DRAFT" || value === "PLANNED" ? "warning" : "default"; return <Tag color={color}>{label}</Tag>; }
