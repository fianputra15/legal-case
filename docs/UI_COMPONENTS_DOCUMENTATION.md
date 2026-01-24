# UI Components Documentation

This documentation covers all the shared UI components located in `/src/shared/ui/`. These components are designed to be reusable across the entire application following consistent design patterns.

## Table of Contents

1. [Button](#button)
2. [ConfirmationModal](#confirmation-modal)
3. [Dialog Components](#dialog-components)
4. [Typography](#typography)
5. [FormField](#form-field)
6. [CaseCard](#case-card)
7. [CaseFilters](#case-filters)
8. [CaseList](#case-list)
9. [DocumentList](#document-list)
10. [DocumentUploadModal](#document-upload-modal)

---

## Button

A versatile button component with multiple variants and sizes.

### Props

```typescript
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'default' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}
```

### Variants

- **primary**: Brand-colored button (default)
- **secondary**: Muted background with subtle styling
- **outline**: White background with border
- **default**: Same as primary
- **destructive**: Red background for dangerous actions

### Sizes

- **sm**: Small button (height: 8, padding: 3)
- **md**: Medium button (height: 10, padding: 4) - default
- **lg**: Large button (height: 12, padding: 6)

### Example Usage

```tsx
import { Button } from '@/shared/ui';

// Primary button
<Button onClick={() => console.log('clicked')}>
  Save Changes
</Button>

// Destructive button for dangerous actions
<Button variant="destructive" size="sm">
  Delete
</Button>

// Outlined secondary button
<Button variant="outline" disabled>
  Cancel
</Button>
```

---

## Confirmation Modal

A modal component for confirming user actions, especially destructive ones.

### Props

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  description: string;
  confirmText?: string;        // Default: 'Confirm'
  cancelText?: string;         // Default: 'Cancel'
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}
```

### Example Usage

```tsx
import { ConfirmationModal } from '@/shared/ui';

const [showDeleteModal, setShowDeleteModal] = useState(false);

<ConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDeleteCase}
  title="Delete Case"
  description="Are you sure you want to delete this case? This action cannot be undone."
  confirmText="Delete"
  cancelText="Cancel"
  variant="destructive"
  isLoading={deleting}
/>
```

---

## Dialog Components

A set of composable dialog components for creating custom modals.

### Components

- `Dialog`: Root dialog wrapper
- `DialogContent`: Content container with styling
- `DialogHeader`: Header section wrapper
- `DialogTitle`: Title heading
- `DialogDescription`: Description text
- `DialogFooter`: Footer with actions

### Example Usage

```tsx
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/shared/ui';

<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Case Details</DialogTitle>
      <DialogDescription>
        View and edit case information.
      </DialogDescription>
    </DialogHeader>
    
    {/* Your content here */}
    
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>
        Save
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Typography

A flexible typography component supporting various text styles and formatting options.

### Props

```typescript
interface TypographyProps {
  variant?: 'sm' | 'xs' | 'headline' | 'md';
  children: ReactNode;
  className?: string;
  fontSize?: string | number;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  fontFamily?: 'sans' | 'serif' | 'mono' | 'dm-sans' | 'newsreader';
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
  lineHeight?: string | number;
  letterSpacing?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}
```

### Example Usage

```tsx
import { Typography } from '@/shared/ui';

<Typography variant="headline" weight="bold" as="h1">
  Legal Case Management
</Typography>

<Typography variant="sm" color="gray-600" align="center">
  Manage your legal cases efficiently
</Typography>
```

---

## FormField

A comprehensive form field component supporting text inputs, textareas, and select dropdowns.

### Props

```typescript
type FormFieldProps = InputProps | TextareaProps | SelectProps;

interface BaseFormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

// For text inputs
interface InputProps extends BaseFormFieldProps {
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// For textareas
interface TextareaProps extends BaseFormFieldProps {
  type: 'textarea';
  placeholder?: string;
  value: string;
  rows?: number;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

// For select dropdowns
interface SelectProps extends BaseFormFieldProps {
  type: 'select';
  value: string | number;
  options: Array<{ value: string | number; label: string }>;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}
```

### Example Usage

```tsx
import { FormField } from '@/shared/ui';

// Text input
<FormField
  name="title"
  label="Case Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  placeholder="Enter case title"
  required
  error={titleError}
  hint="Be descriptive but concise"
/>

// Select dropdown
<FormField
  type="select"
  name="category"
  label="Case Category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={categoryOptions}
  required
/>

// Textarea
<FormField
  type="textarea"
  name="description"
  label="Description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
  rows={4}
  placeholder="Describe the case details..."
/>

// Disabled field (for closed cases)
<FormField
  name="title"
  label="Case Title"
  value={title}
  onChange={(e) => setTitle(e.target.value)}
  disabled={isCaseClosed}
  className="bg-gray-100"
/>
```

---

## CaseCard

A card component for displaying case information with interactive actions.

### Props

```typescript
interface CaseCardProps {
  id: string;
  title: string;
  description?: string;
  status: string;
  category: string;
  priority: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  documentCount?: number;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  showOwner?: boolean;
  userRole?: "CLIENT" | "LAWYER" | "ADMIN";
  hasAccess?: boolean;
  grantedAt?: Date | string | null;
  hasPendingRequest?: boolean;
  requestedAt?: Date | string | null;
  onRequestSuccess?: (caseId: string) => void;
  onRequestError?: (message: string) => void;
  onWithdrawSuccess?: (caseId: string) => void;
  onWithdrawError?: (message: string) => void;
  onEdit?: (caseId: string) => void;
}
```

### Features

- **Visual Status Indicators**: Shows case status with appropriate styling
- **Category Badges**: Displays legal category with formatted labels
- **Document Count**: Shows number of attached documents
- **Action Buttons**: Request access, withdraw request, edit (role-based)
- **Date Formatting**: Consistent date display
- **Responsive Design**: Works on mobile and desktop
- **Access Control**: Buttons shown based on user role and permissions

### Example Usage

```tsx
import { CaseCard } from '@/shared/ui';

<CaseCard
  id={case.id}
  title={case.title}
  description={case.description}
  status={case.status}
  category={case.category}
  priority={case.priority}
  createdAt={case.createdAt}
  updatedAt={case.updatedAt}
  ownerId={case.ownerId}
  documentCount={case.documentCount}
  userRole={userRole}
  hasAccess={hasAccess}
  hasPendingRequest={hasPendingRequest}
  onRequestSuccess={(caseId) => console.log('Access requested:', caseId)}
  onRequestError={(message) => console.error('Request failed:', message)}
  onEdit={(caseId) => router.push(`/edit-case/${caseId}`)}
/>
```

---

## CaseFilters

A filtering component for case lists with category, status, and sorting options.

### Props

```typescript
interface CaseFiltersProps {
  category: string;
  status: string;
  sortBy: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sortBy: string) => void;
  totalCases: number;
  filteredCount: number;
}
```

### Features

- **Category Filter**: Filter by legal categories
- **Status Filter**: Filter by case status (OPEN, CLOSED, etc.)
- **Sort Options**: Sort by date, priority, title, etc.
- **Result Counter**: Shows filtered vs total count
- **Responsive Layout**: Adapts to different screen sizes

### Example Usage

```tsx
import { CaseFilters } from '@/shared/ui';

<CaseFilters
  category={selectedCategory}
  status={selectedStatus}
  sortBy={sortBy}
  onCategoryChange={setSelectedCategory}
  onStatusChange={setSelectedStatus}
  onSortChange={setSortBy}
  totalCases={allCases.length}
  filteredCount={filteredCases.length}
/>
```

---

## CaseList

A comprehensive list component for displaying cases with loading states, pagination, and error handling.

### Props

```typescript
interface CaseListProps {
  cases: CaseCardProps[];
  loading?: boolean;
  error?: string;
  emptyStateConfig?: {
    title: string;
    description: string;
    showCreateButton?: boolean;
    createButtonText?: string;
    createButtonHref?: string;
  };
  onRetry?: () => void;
  onRequestAccess?: (caseId: string) => void;
  onWithdrawRequest?: (caseId: string) => void;
  onRequestSuccess?: (caseId: string) => void;
  onRequestError?: (message: string) => void;
  onWithdrawSuccess?: (caseId: string) => void;
  onWithdrawError?: (message: string) => void;
  onEdit?: (caseId: string) => void;
  pagination?: PaginationProps;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}
```

### Features

- **Loading States**: Skeleton loading animation
- **Error Handling**: Error display with retry functionality
- **Empty States**: Customizable empty state with optional create button
- **Pagination**: Full pagination controls with page info
- **Grid Layout**: Responsive grid that adapts to screen size
- **Event Handling**: Comprehensive event system for all actions

### Example Usage

```tsx
import { CaseList } from '@/shared/ui';

<CaseList
  cases={cases}
  loading={loading}
  error={error}
  emptyStateConfig={{
    title: "No Cases Found",
    description: "You haven't created any cases yet. Create your first case to get started.",
    showCreateButton: true,
    createButtonText: "Create Case",
    createButtonHref: "/create-case"
  }}
  onRetry={fetchCases}
  onRequestAccess={handleRequestAccess}
  onWithdrawRequest={handleWithdrawRequest}
  onRequestSuccess={(caseId) => {
    toast.success('Access requested successfully');
    refetch();
  }}
  onRequestError={(message) => toast.error(message)}
  onEdit={(caseId) => router.push(`/edit-case/${caseId}`)}
  pagination={{
    currentPage: 1,
    totalPages: 5,
    itemsPerPage: 10,
    totalItems: 50,
    onPageChange: setPage
  }}
/>
```

---

## DocumentList

A component for displaying and managing documents within a case.

### Props

```typescript
interface DocumentListProps {
  caseId: string;
  onDocumentsChange?: (documents: DocumentEntity[]) => void;
  documents: DocumentEntity[];
  loading: boolean;
  error: string | null;
}
```

### Features

- **Document Display**: Shows document name, type, size, and upload date
- **Download Functionality**: Built-in document download with progress indicators
- **Type Labels**: Human-readable document type labels
- **File Size Formatting**: Proper file size display (KB, MB, GB)
- **Loading States**: Document-specific loading indicators
- **Error Handling**: Download error handling with user feedback
- **Responsive Design**: Mobile-friendly layout

### Example Usage

```tsx
import { DocumentList } from '@/shared/ui';

<DocumentList
  caseId={caseId}
  documents={documents}
  loading={documentsLoading}
  error={documentsError}
  onDocumentsChange={(docs) => {
    console.log('Document count:', docs.length);
  }}
/>
```

---

## DocumentUploadModal

A modal component for uploading documents to cases with drag-and-drop support.

### Props

```typescript
interface DocumentUploadModalProps {
  caseId: string;
  onUploadSuccess: (document: DocumentEntity) => void;
  onClose?: () => void;
  onOpen?: () => void;
  open: boolean;
}
```

### Features

- **Drag & Drop**: Intuitive drag-and-drop file upload
- **File Validation**: Client-side validation for file type and size
- **Document Types**: Support for various document types (PDF, DOCX, images)
- **Progress Indicators**: Upload progress and loading states
- **Error Handling**: Comprehensive error messages for validation and upload failures
- **File Preview**: Shows selected file information before upload
- **Type Selection**: Dropdown to categorize document type

### Supported File Types

- **PDF**: `application/pdf`
- **Word Documents**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Images**: `image/png`, `image/jpeg`

### File Size Limits

- Maximum file size: 25MB

### Example Usage

```tsx
import { DocumentUploadModal } from '@/shared/ui';

const [uploadModalOpen, setUploadModalOpen] = useState(false);

<DocumentUploadModal
  caseId={caseId}
  open={uploadModalOpen}
  onClose={() => setUploadModalOpen(false)}
  onUploadSuccess={(document) => {
    console.log('Document uploaded:', document.originalName);
    setUploadModalOpen(false);
    refreshDocuments();
    toast.success('Document uploaded successfully');
  }}
/>
```

---

## Component Import Guidelines

All components should be imported from the shared UI index:

```typescript
// ✅ Preferred - Import from main index
import { 
  Button, 
  FormField, 
  CaseCard, 
  DocumentList
} from '@/shared/ui';

// ❌ Avoid - Direct component imports
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field/form-field';
```

---

## Styling Guidelines

### Theme Integration

All components use consistent styling that integrates with the application theme:

- **Colors**: Brand colors (`brand`, `brand-orange-600`, etc.)
- **Typography**: Consistent font families and sizes
- **Spacing**: Standardized padding and margins
- **Borders**: Consistent border radius and colors

### Responsive Design

Components are built with responsive design principles:

- **Mobile First**: Default styling works on mobile
- **Breakpoint Support**: Uses Tailwind responsive prefixes
- **Flexible Layouts**: Components adapt to container sizes

### Accessibility

Components follow accessibility best practices:

- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG guidelines

---

## Best Practices

### Component Usage

1. **Consistent Import**: Always import from `@/shared/ui`
2. **Prop Validation**: Use TypeScript interfaces for prop validation
3. **Error Handling**: Implement proper error boundaries
4. **Loading States**: Show loading states for async operations
5. **Event Handling**: Use callback patterns for component communication

### Styling

1. **Tailwind Classes**: Use Tailwind for consistent styling
2. **Custom Classes**: Minimal custom CSS, prefer utility classes
3. **Responsive Design**: Test on multiple screen sizes
4. **Theme Consistency**: Use theme colors and spacing

### Performance

1. **Lazy Loading**: Use React.lazy for heavy components
2. **Memoization**: Memoize expensive calculations
3. **Event Handlers**: Use useCallback for event handlers
4. **Prop Optimization**: Avoid creating new objects in render

This documentation should be kept up-to-date as components evolve and new features are added. Each component is designed to be reusable and maintainable while providing a consistent user experience across the application.