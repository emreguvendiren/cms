---
name: antd-product-design
description: Design, implement, or review React interfaces built with Ant Design. Use for pages, forms, tables, dashboards, navigation, modals, drawers, feedback, responsive layouts, shared UI components, or centralized theme changes.
---

# Ant Design Product UI/UX

## Mission

Create interfaces that are:

Business-specific
User-friendly
Visually consistent
Accessible
Responsive
Efficient for frequent users
Clearly designed by a product team rather than generated from a generic AI template

Ant Design components are implementation primitives.

Ant Design must not become the complete visual identity of the product.

The final interface must reflect the user's task, business domain, data hierarchy, terminology, and operating frequency.

Required files

Before designing or implementing UI, inspect:

cmsFrontend/src/app/theme/palette.ts
cmsFrontend/src/app/theme/antdTheme.ts
cmsFrontend/src/app/providers/AppProviders.tsx
cmsFrontend/src/shared/ui/
The relevant feature folder
Existing pages that solve similar user tasks

When these files do not exist, create the design-system foundation before building multiple screens.

Do not create a separate visual language for an individual feature.

Required workflow

Before editing code:

Identify who will use the screen.
Identify the user's primary goal.
Identify the most frequent action.
Identify the most important information.
Identify secondary and destructive actions.
Identify loading, empty, error, success and permission states.
Inspect existing components and screen patterns.
Define the information hierarchy.
Select Ant Design components according to the user task.
Explain any new shared UI abstraction before creating it.

After implementation:

Review the screen at mobile, tablet and desktop widths.
Test keyboard navigation.
Check text and component contrast.
Check loading, empty, error, success and disabled states.
Check long text and large-data behavior.
Check whether the interface resembles a generic AI-generated dashboard.
Run frontend type checking, linting, tests and build.
Design-system rules
Centralized theme

All application colors, typography, borders, shadows, radii and control sizes must originate from the centralized theme.

Never hardcode colors inside:

Feature components
Page components
CSS modules
Styled components
Inline styles
Table column render functions
Charts
Icons
Empty states

Forbidden examples:

<div style={{ color: "#1677ff" }} />
.userCard {
  background: #ffffff;
  border: 1px solid #e5e7eb;
}

Use:

Ant Design Design Tokens
Semantic application tokens
Theme CSS variables
theme.useToken()
Approved chart tokens

Do not create page-specific color palettes.

Do not change the primary color between modules or pages.

Status colors may only represent their semantic meanings:

Success
Warning
Error
Information
Neutral

Do not use status colors as decoration.

Never communicate status using color alone. Add text, an icon, a label or another visible indicator.

Color distribution

Use neutral colors for most of the interface.

The brand color should emphasize:

The primary action
Active navigation
Selected state
Links
Important interactive focus

Do not apply the brand color to every heading, icon, card and border.

A screen should normally have one dominant accent color.

Avoid multiple competing accent colors on the same screen.

Spacing

Use an 8-pixel spacing system.

Preferred values:

4px: very small internal separation
8px: tightly related elements
16px: normal component spacing
24px: section spacing
32px: major section separation
48px: page-level separation when justified

Do not introduce arbitrary values such as:

13px
19px
27px
38px

Exceptions require a concrete visual reason.

Use spacing to communicate relationships.

Related content must be closer together than unrelated content.

Border radius

Use restrained border radii.

Recommended hierarchy:

Small controls: theme control radius
Inputs and buttons: 8px
Cards and containers: 8px or 12px
Large promotional surfaces: maximum 16px

Do not use large rounded corners on every surface.

Do not use pill-shaped containers unless the component is actually:

A tag
A filter chip
A segmented control
A compact status element
A pill button with a product-specific reason
Shadows

Use shadows only to communicate elevation.

Valid use cases:

Dropdown
Popover
Modal
Drawer
Floating toolbar
Temporarily elevated object

Normal page sections and cards should generally use spacing, typography, background or borders instead of strong shadows.

Do not use glowing shadows.

Do not use colored shadows.

Do not make every card appear to float.

Generic AI design prohibitions

The following patterns are forbidden unless explicitly required by the product's brand:

Purple-to-blue gradients
Random gradients
Neon accents
Glowing borders
Glassmorphism
Excessive backdrop blur
Decorative gradient blobs
Floating abstract circles
Sparkle icons used as decoration
Robot or magic-wand icons for ordinary features
Oversized hero text inside internal business applications
Every section placed inside a rounded card
Four statistic cards automatically placed at the top of every page
Meaningless charts added to make a dashboard appear advanced
Random avatars
Fake activity feeds
Fake metrics
Decorative badges without user value
Large empty spaces added only to appear premium
Excessive animations
Empty marketing copy such as “Unlock your potential”
Generic headings such as “Welcome back” when task-specific information is available
Identical dashboard structures across unrelated business modules

Do not automatically generate:

Header
Four KPI cards
Large line chart
Recent activity card
Quick actions card

The page structure must be derived from the real user task.

Business-specific design

Before creating a page, answer:

What decision does this page help the user make?
What task does the user need to complete?
Which information must be scanned quickly?
Which action occurs most frequently?
Which mistakes are expensive?
Which data requires comparison?
Which information can be progressively disclosed?

Use domain terminology instead of generic labels.

Prefer:

Müşteri limitini güncelle

Over:

Kaydet

Prefer:

Seçili 8 müşteriyi portföye ekle

Over:

Devam et

Headings, empty states, confirmations and errors must describe the actual business operation.

Page anatomy

A normal application page should usually contain:

Breadcrumb only when it improves orientation
Clear page title
Optional short task explanation
Primary action
Filters or contextual controls
Main content
Pagination or continuation controls when required

Do not add breadcrumbs to flat navigation structures.

Do not repeat the same title in:

Breadcrumb
Page header
Card title
Table title

Avoid unnecessary visual nesting.

Bad:

Page
└─ Card
   └─ Card
      └─ Table

Prefer:

Page
├─ Header
├─ Filters
└─ Table

Use a card only when the content represents a distinct object or conceptual group.

Action hierarchy

Each page or task section should normally have one primary action.

Use button hierarchy intentionally:

primary: main action
default: secondary action
text: low-emphasis action
link: navigational action
danger: destructive action

Do not display several primary buttons next to each other.

Destructive actions must not visually compete with the normal primary action.

Use direct action labels:

Oluştur
Güncelle
Davet gönder
Raporu indir
Kullanıcıyı pasifleştir

Avoid vague labels:

Tamam
Devam
İşlem
Onayla

unless the meaning is completely clear from the surrounding context.

Ant Design component selection
Layout

Prefer:

Flex
Space
Grid
Semantic HTML
Application layout primitives

Do not use deeply nested Row and Col structures when simple flexbox is clearer.

Use the 24-column grid for layouts that genuinely require responsive column relationships.

Do not use grid merely to position two buttons.

Forms

Use Ant Design Form for structured business forms.

Every form must include:

Clear labels
Appropriate input types
Required-field indication
Inline validation
Actionable error messages
Submission loading state
Disabled duplicate submission
Preservation of user input after recoverable errors

Do not use placeholders as replacements for labels.

Placeholder text should provide an example or expected format, not repeat the label.

Bad:

Label: Ad
Placeholder: Adınızı girin

Better:

Label: Vergi numarası
Placeholder: 10 haneli vergi numarası

Group related fields.

For long forms:

Fewer than 7 fields: usually keep as one group
Between 7 and 15 fields: group by subject
More than 15 fields: consider sections, steps or tabs according to the workflow

Do not split a short form into a wizard.

Do not place unrelated fields on the same row merely to save vertical space.

Validation messages must explain how to fix the problem.

Bad:

Geçersiz değer

Better:

Vergi numarası 10 rakamdan oluşmalıdır.
Tables

Use Table for structured data comparison.

Before implementing a table, determine:

Most important columns
Columns frequently compared
Sortable columns
Filterable columns
Default sorting
Row identity
Row-level actions
Bulk actions
Expected data size
Mobile behavior

Requirements:

Use stable rowKey.
Use server-side pagination for large datasets.
Use deterministic sorting.
Keep status and action values readable.
Right-align numeric values.
Keep action columns compact.
Use - for genuinely missing values.
Format dates, currencies and numbers consistently.
Add loading, empty and error behavior.
Prevent layout jumping while loading.
Do not display every database field.
Do not hide essential actions only behind hover.
Do not use color alone for status.

Avoid placing five or more independent icon buttons in every row.

Use a compact overflow menu for infrequent actions.

Keep the most frequent row action directly visible when appropriate.

Do not add horizontal scrolling without reviewing column priority.

For narrow screens:

Remove low-priority columns
Show a focused list layout
Use expandable details
Preserve the primary action

Do not force a desktop table into a 360-pixel viewport.

Cards

Cards are not the default page container.

Use Card when information represents:

A distinct object
A compact summary
A selectable item
A group with independent actions
A meaningful dashboard metric

Do not place every filter, form, table and heading in separate cards.

Do not add cards only to make the page look visually busy.

Modal

Use a modal when:

The user must focus on a short blocking decision
A dangerous action requires confirmation
A short contextual task should not navigate away

Do not use a modal for:

Long forms
Multi-step workflows
Large tables
Complex comparisons
Content users may need to reference while editing

Use a page or drawer for complex tasks.

The modal title must describe the decision or action.

Bad:

Uyarı

Better:

Kullanıcı pasifleştirilsin mi?

Destructive confirmations must state the consequence.

Drawer

Use a drawer for contextual tasks that benefit from preserving the current page.

Suitable examples:

Record preview
Filters
Lightweight editing
Secondary details

Do not use nested drawers.

Do not use a drawer when the content requires the full width of a page.

Feedback

Use feedback according to urgency and persistence:

Inline validation: field-specific problem
message: short confirmation of an immediate action
notification: important asynchronous or background result
Alert: persistent page-level information
Result: completed, blocked or failed page-level state
Modal: blocking decision or confirmation

Use the instances provided by App.useApp().

Do not call static message, notification or Modal methods directly when theme or context is required.

Feedback text must tell the user what happened.

Bad:

İşlem başarılı.

Better:

Müşteri portföye eklendi.

Error feedback should include a recovery action when possible.

Empty states

Every data-dependent screen must have an intentional empty state.

An empty state should explain:

Why there is no content
Whether this is expected
What the user can do next

Differentiate:

No records exist
Filters returned no records
User lacks permission
Data failed to load
Feature is not configured

Do not use the same generic empty illustration and text for every condition.

Do not display a creation action when the user does not have creation permission.

Loading states

Use loading feedback at the smallest correct scope.

Button loading: action submission
Skeleton: content structure loading
Spin: small local region
Table loading: table request
Full-page loading: only for true application-level blocking

Do not block the entire screen for a small row action.

Do not display both a global spinner and a button spinner for the same operation.

Avoid artificial loading animations.

Accessibility

Target WCAG 2.2 AA for normal application flows.

Requirements:

Normal text contrast must be at least 4.5:1.
Large text contrast must be at least 3:1.
Important component boundaries and states must have at least 3:1 contrast.
Keyboard focus must remain visible.
Keyboard focus must not be hidden by sticky content.
Color must not be the only status indicator.
Icon-only buttons require an accessible name.
Form errors must be associated with their fields.
Modal focus must be managed correctly.
Interactive elements must use semantic HTML.
Clickable div elements are forbidden when a button or link is appropriate.
Keyboard order must follow the visual and logical order.

Do not remove outlines without replacing them with a clearly visible focus indicator.

Tooltips do not replace accessible names.

Responsive behavior

Review at minimum:

360px
768px
1280px
1440px

Responsive behavior must be designed, not added after desktop implementation.

At narrow widths:

Preserve the primary action.
Preserve important context.
Stack form fields when necessary.
Reduce low-priority table columns.
Prevent text clipping.
Avoid fixed widths that create unnecessary overflow.
Keep touch targets comfortably usable.
Do not hide critical functionality without an alternative.

A mobile layout does not have to look identical to the desktop layout.

It must support the same core task.

Typography and content

Use a restrained hierarchy.

Recommended roles:

Page title
Section title
Body
Secondary text
Supporting label
Metadata

Do not use five different heading sizes on one screen.

Do not make every heading bold.

Avoid excessive uppercase text.

Avoid centered text in data-heavy business screens.

Use sentence case unless the language convention requires otherwise.

Text must sound like the product's domain, not generic marketing copy.

Do not generate fake user names, companies, amounts or analytics in production UI.

Icon rules

Use @ant-design/icons unless the project has an approved icon system.

Icons must support comprehension.

Do not use icons only for decoration.

Do not mix unrelated icon styles.

Icon-only actions require:

Accessible name
Tooltip when the action may not be obvious
Adequate hit area

Do not use:

Sparkles for standard automation
Magic wand for standard editing
Robot icon for every AI-assisted feature
Lightning icon for every fast action

AI functionality should be represented according to its actual behavior.

Motion

Motion must communicate:

State change
Spatial relationship
Progress
Entry or exit
User action result

Do not add motion only to make the product feel modern.

Avoid:

Constant floating
Pulsing decorations
Large spring animations
Page transitions in frequent operational workflows
Long success animations

Respect reduced-motion preferences.

React rendering and Ant Design performance

Do not optimize blindly.

First inspect:

State ownership
Parent render frequency
Context size
New object and function creation
Table column definitions
Expensive cell render functions
Large lists
Unnecessary Effects
Derived state stored in state

Rules:

Keep UI state close to its owner.
Do not put all UI state in one global context.
Split contexts by responsibility and update frequency.
Keep provider values stable.
Do not use useMemo and useCallback automatically.
Memoize only when render cost or reference stability matters.
Keep table column definitions stable when needed.
Avoid expensive transformations inside table cell renderers.
Use server-side filtering, sorting and pagination for large datasets.
Use virtualization only when data volume justifies its complexity.
Do not use shouldCellUpdate without understanding closure and stale-data risks.
Do not recreate the entire theme object during every render.
Export the theme configuration as a stable module-level constant.
Shared component rules

Create shared components only when:

At least two real features need the same behavior
Their semantics are the same
Their interaction patterns are the same
Centralized maintenance creates a concrete benefit

Good shared components may include:

PageHeader
PageContainer
FormSection
DataTable
StatusTag
EmptyState
ErrorState
ConfirmAction
PermissionGuard

Do not create a generic component with dozens of boolean props.

Bad:

<GenericPage
  hasHeader
  hasFilters
  hasTable
  hasTabs
  hasSidebar
  isEditable
  isExportable
  isSelectable
/>

Prefer composition:

<PageContainer>
  <PageHeader
    title="Müşteriler"
    actions={<CreateCustomerButton />}
  />

  <CustomerFilters />

  <CustomerTable />
</PageContainer>

Do not wrap an Ant Design component only to rename its props.

A wrapper must provide meaningful product behavior or enforce a design-system rule.

Review checklist

Before declaring UI work complete, verify:

Product
The screen has a clear user goal.
The primary action is obvious.
Domain terminology is used.
Information is ordered by importance.
Destructive actions are clearly separated.
Empty and error states are actionable.
Visual
Only approved design tokens are used.
There are no feature-level hardcoded colors.
Spacing follows the approved scale.
Radius and shadows are restrained.
The screen does not use generic AI visual patterns.
Cards are used only when semantically meaningful.
The visual hierarchy remains clear without decoration.
Ant Design
Components match their intended purpose.
ConfigProvider theme is used.
App.useApp() is used for contextual feedback.
Form validation is actionable.
Table row keys are stable.
Large datasets use server-side operations.
Modal and drawer usage is appropriate.
Accessibility
Contrast requirements pass.
Keyboard navigation works.
Focus is visible.
Icon buttons have accessible names.
Status is not communicated through color alone.
Form errors are associated correctly.
Responsive
Mobile, tablet and desktop layouts were reviewed.
Important actions remain available.
Tables have an intentional narrow-screen strategy.
Long content does not break the layout.
Engineering
Type checking passes.
Lint passes.
Tests pass.
Production build passes.
No debug UI remains.
No fake production data remains.
No unnecessary abstraction was introduced.
Required completion report

When UI work is finished, report:

User goal supported
Information hierarchy used
Primary and secondary actions
Existing components reused
New shared components introduced
Theme tokens changed
Responsive behavior
Accessibility checks
Loading, empty, error and success states
Potential rendering risks
Commands executed
Remaining design or implementation risks

Do not claim completion when:

Colors are hardcoded outside the theme
Required states are missing
Keyboard interaction is broken
The layout breaks at supported widths
The screen uses generic AI decorations
The UI has not been checked against existing product patterns
Type checking, linting, tests or build fail
