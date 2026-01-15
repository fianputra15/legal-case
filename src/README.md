# Feature-Sliced Design (FSD) Structure

This project follows the Feature-Sliced Design (FSD) architectural pattern. Each layer has its specific area of responsibility and is aligned with business needs.

## Layer Structure

### 📱 `/src/app` - Application Layer
Handles the initialization of the application logic. It defines providers, routers, global styles, global type declarations, and more. Essentially, it serves as the entry point of the application.

**Contents:**
- `providers/` - App-level providers (Theme, React Query, Auth, etc.)
- `styles/` - Global styles
- `types/` - Global type declarations

### 📄 `/src/views` - Views Layer
Includes the application's views/pages. Each view is a composition of widgets and features.

**Structure:**
```
views/
  home/
    ui/
      home-page.tsx
    index.ts
```

### 🧩 `/src/widgets` - Widgets Layer
Standalone UI components used on pages. Widgets are typically composed of features and entities.

**Example structure:**
```
widgets/
  header/
    ui/
      header.tsx
    index.ts
  sidebar/
    ui/
      sidebar.tsx
    index.ts
```

### ✨ `/src/features` - Features Layer (Optional)
Focuses on user interactions and functionality that add business value, such as liking content, writing reviews, or rating products.

**Example structure:**
```
features/
  auth/
    login/
      ui/
        login-form.tsx
      model/
        login.store.ts
      api/
        login.api.ts
    register/
      ui/
        register-form.tsx
```

### 🏢 `/src/entities` - Entities Layer (Optional)
Represents core business entities, such as users, reviews, and comments.

**Example structure:**
```
entities/
  user/
    model/
      types.ts
      user.store.ts
    api/
      user.api.ts
    ui/
      user-card.tsx
  case/
    model/
      types.ts
    api/
      case.api.ts
```

### 🔧 `/src/shared` - Shared Layer
Holds reusable components and utilities that aren't linked to specific business logic. It includes the UI kit, axios setup, app configurations, and general helpers.

**Contents:**
- `ui/` - UI components (Button, Input, etc.)
- `lib/` - Utility functions
- `api/` - API client configuration
- `config/` - App configuration
- `types/` - Common types

## Rules and Best Practices

1. **Import Rule**: A layer can only import from layers below it or from the shared layer.
2. **Public API**: Each segment should have an index.ts file that exports its public API.
3. **Isolation**: Segments within the same layer cannot import from each other directly.
4. **Single Responsibility**: Each layer has a single responsibility and clear boundaries.

## Path Aliases

The following path aliases are configured in `tsconfig.json`:

- `@/*` - Points to `./src/*`
- `@/app/*` - Points to `./src/app/*`
- `@/views/*` - Points to `./src/views/*`
- `@/widgets/*` - Points to `./src/widgets/*`
- `@/features/*` - Points to `./src/features/*`
- `@/entities/*` - Points to `./src/entities/*`
- `@/shared/*` - Points to `./src/shared/*`

## Getting Started

The project structure is now ready for development. You can:

1. Add new views in the `views/` directory
2. Create reusable widgets in the `widgets/` directory
3. Implement business features in the `features/` directory
4. Define core entities in the `entities/` directory
5. Add shared utilities and components in the `shared/` directory