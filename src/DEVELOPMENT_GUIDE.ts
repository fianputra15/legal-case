/**
 * Example of how to create a new feature following FSD architecture
 * 
 * This file demonstrates the proper way to structure a new feature
 * in the legal case workspace following FSD principles.
 */

// Example: Case Management Feature Structure
/*
src/features/case-management/
  create-case/
    ui/
      create-case-form.tsx      # Form component
      create-case-modal.tsx     # Modal wrapper
    model/
      create-case.store.ts      # State management
      validation.ts             # Form validation rules
    api/
      create-case.api.ts        # API calls
    index.ts                    # Public API exports
  
  edit-case/
    ui/
      edit-case-form.tsx
    model/
      edit-case.store.ts
    api/
      edit-case.api.ts
    index.ts
    
  case-list/
    ui/
      case-list.tsx
      case-item.tsx
    model/
      case-list.store.ts
      filters.ts
    api/
      case-list.api.ts
    index.ts
*/

// Example: Legal Case Entity
/*
src/entities/case/
  model/
    types.ts                    # Case-related types
    case.store.ts              # Case business logic
  api/
    case.api.ts                # Case API operations
  ui/
    case-card.tsx              # Reusable case display component
  index.ts                     # Public exports
*/

// Example: Case Dashboard Widget
/*
src/widgets/case-dashboard/
  ui/
    case-dashboard.tsx         # Main dashboard component
    case-stats.tsx             # Statistics component
    recent-cases.tsx           # Recent cases list
  model/
    dashboard.store.ts         # Dashboard state
  index.ts
*/

// Example: Case Detail View/Page
/*
src/views/case-detail/
  ui/
    case-detail-page.tsx       # Main page component
  model/
    case-detail.store.ts       # Page-specific state
  index.ts
*/

export {};

/**
 * Usage Examples:
 * 
 * // In app router page
 * import { CaseDetailPage } from '@/views/case-detail';
 * 
 * // In a widget
 * import { CreateCaseForm } from '@/features/case-management/create-case';
 * import { CaseCard } from '@/entities/case';
 * import { Button } from '@/shared/ui';
 * 
 * // In a feature
 * import { Case, CaseStatus } from '@/entities/case';
 * import { apiClient } from '@/shared/api';
 * import { formatDate } from '@/shared/lib';
 * 
 * Remember:
 * 1. Always import from public APIs (index.ts files)
 * 2. Follow the dependency rule: higher layers can import from lower layers
 * 3. Use shared layer for reusable components and utilities
 * 4. Keep business logic in appropriate layers
 */