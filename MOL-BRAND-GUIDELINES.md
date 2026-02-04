# MOL Group Brand Guidelines

> Documentation for AI agents and developers building MOL Group applications.

## Company Overview

**MOL Group** is a leading integrated Central Eastern European oil and gas corporation headquartered in Budapest, Hungary. Operations span 30+ countries with approximately 25,000 employees across 47 nationalities.

- **Tagline**: "The Energy of Positive Change"
- **Strategy**: Shape Tomorrow 2030+
- **Focus**: Transitioning toward sustainable energy and low-carbon circular economy

---

## Brand Identity

### Core Concept

The brand centers on **"The Energy of Positive Change"** - an optimistic, forward-looking, transformation-focused identity that balances traditional energy operations with sustainability goals.

### Brand Values

- **Quality & Reliability** - Customers associate MOL with dependable products and services
- **Dynamic Development** - Employees work in an innovative, dignity-focused environment
- **Safety & Responsibility** - Commitment to health, safety, and environmental protection
- **Continuous Improvement** - Constantly increasing value through shareholder trust

### Tone of Voice

| Attribute | Description |
|-----------|-------------|
| **Optimistic** | Forward-looking, solution-focused messaging |
| **Professional** | Corporate governance standards across diverse markets |
| **Sustainable** | Emphasis on environmental and social responsibility |
| **Dynamic** | Energy, transformation, and positive change |
| **Confident** | Regional leader with global ambitions |

---

## Visual Identity System

### Design Philosophy

The visual identity was created by **GW+Co** and won awards at Transform Awards 2016:
- 🥈 Silver: Best Use of Typography
- 🥉 Bronze: Best Visual Identity (Energy & Extractions sector)

### Grid System

MOL Group uses a **30-degree angle grid** derived from the logo structure:
- Organizes images and graphic elements
- Creates visual consistency across all applications
- Enables creative flexibility while maintaining brand cohesion

### Brand Matrix

A tool allowing users to **"dial the volume"** up or down:
- Controls visual intensity for different applications
- Balances consistency with creative expression
- Adapts from subtle corporate to bold marketing communications

---

## Color Palette

### Primary Colors (MOL Group)

| Color | Hex | RGB | Usage |
|-------|-----|-----|-------|
| **MOL Red** | `#C7423B` | 199, 66, 59 | Primary brand color, logo |
| **MOL Olive/Green** | `#B3C866` | 179, 200, 102 | Secondary accent, sustainability |
| **MOL Tan** | `#BC8A52` | 188, 138, 82 | Warm accent |
| **Light Red** | `#E5A8A5` | 229, 168, 165 | Backgrounds, highlights |
| **Light Green** | `#EDF2DC` | 237, 242, 220 | Backgrounds, sustainability themes |

### Gradient System

The color palette uses **dynamic gradients** derived from sub-brands:
- Gradients expand as the organization grows
- Each sub-brand contributes to the overall palette
- Creates visual energy and movement

### Recommended CSS Variables

```css
:root {
  /* MOL Group Primary */
  --mol-red: #C7423B;
  --mol-green: #B3C866;
  --mol-tan: #BC8A52;
  
  /* Light Variants */
  --mol-red-light: #E5A8A5;
  --mol-green-light: #EDF2DC;
  
  /* Neutrals */
  --mol-white: #FFFFFF;
  --mol-black: #1A1A1A;
  --mol-gray-100: #F5F5F5;
  --mol-gray-200: #E5E5E5;
  --mol-gray-500: #737373;
  --mol-gray-800: #262626;
  
  /* Gradients */
  --mol-gradient-primary: linear-gradient(135deg, #C7423B 0%, #BC8A52 100%);
  --mol-gradient-eco: linear-gradient(135deg, #B3C866 0%, #EDF2DC 100%);
}
```

---

## Typography

### Font Recommendations

MOL Group uses custom typography (award-winning at Transform Awards 2016). For digital applications, use these alternatives:

| Purpose | Primary Font | Fallback |
|---------|-------------|----------|
| **Headlines** | Source Sans Pro Bold | Arial Bold |
| **Subheadlines** | Source Sans Pro Semibold | Arial |
| **Body Text** | Source Sans Pro Regular | Arial |
| **Data/Tables** | Source Sans Pro Light | Arial |

### Typography Scale

```css
/* Heading Scale */
--font-size-h1: 3rem;      /* 48px - Major headlines */
--font-size-h2: 2.25rem;   /* 36px - Section headers */
--font-size-h3: 1.5rem;    /* 24px - Subsections */
--font-size-h4: 1.25rem;   /* 20px - Card titles */
--font-size-body: 1rem;    /* 16px - Body text */
--font-size-small: 0.875rem; /* 14px - Captions */

/* Line Heights */
--line-height-tight: 1.2;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;

/* Font Weights */
--font-weight-light: 300;
--font-weight-regular: 400;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

---

## Sub-Brands

### MOL (Service Stations)
- Primary retail fuel brand in Hungary
- Shield-shaped logo with red background and green outline
- "MOL EVO" premium fuel line

### Fresh Corner
- Convenience retail and gastro concept
- 1,400+ locations across 10 CEE countries
- Focus: Quality coffee, fresh food, everyday groceries
- Modern, customer-friendly aesthetic
- Fresh Corner 2.0 features improved layout and design

### INA
- Croatian oil company (MOL Group subsidiary)
- 500+ retail locations in Croatia and Slovenia
- "INA Class" premium fuel offering

### Slovnaft
- Slovak oil company (MOL Group subsidiary)
- Petrochemical operations in Bratislava
- Strong regional presence in Slovakia

### Other Brands
- **Tifon** - Regional service stations
- **Energopetrol** - Regional operations
- **PapOil** - Regional service stations
- **MOL Limo** - Carsharing service

---

## UI Components

### Design System CSS Variables

The application uses a comprehensive set of CSS variables defined in `globals.css`:

```css
:root {
  /* MOL Brand Colors */
  --mol-red: #C7423B;
  --mol-red-hover: #B33A34;
  --mol-green: #B3C866;
  --mol-tan: #BC8A52;
  --bg-sidebar: #1a1a1a;
  
  /* Slate Scale (Neutrals) */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  --slate-400: #94a3b8;
  --slate-500: #64748b;
  --slate-600: #475569;
  --slate-700: #334155;
  --slate-800: #1e293b;
  --slate-900: #0f172a;
  
  /* Text Colors */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #94a3b8;
  
  /* Border Colors */
  --border-default: #e2e8f0;
  --border-subtle: #f1f5f9;
  
  /* Category Badge Colors */
  --badge-financial-bg: #fef2f2;
  --badge-financial-text: #dc2626;
  --badge-esg-bg: #f0fdf4;
  --badge-esg-text: #16a34a;
  --badge-investor-bg: #eff6ff;
  --badge-investor-text: #2563eb;
  --badge-quarterly-bg: #fff7ed;
  --badge-quarterly-text: #ea580c;
  --badge-strategy-bg: #f8fafc;
  --badge-strategy-text: #475569;
  --badge-operations-bg: #f8fafc;
  --badge-operations-text: #475569;
}
```

---

### Sidebar Component

**File:** `src/components/Sidebar.tsx`

Dark-themed navigation sidebar with MOL branding.

**Features:**
- Fixed position, 64px width (`w-16`)
- Dark background (`--bg-sidebar: #1a1a1a`)
- Official MOL logo at top
- Red "+" button for new actions
- Navigation items with active state indicator (red left border)
- Settings and user avatar at bottom

**Props:**
```typescript
interface SidebarProps {
  currentView: 'templates' | 'editor' | 'history';
  onNavigate: (view: 'templates' | 'editor' | 'history') => void;
  onNewPresentation: () => void;
}
```

**Usage:**
```tsx
<Sidebar
  currentView="templates"
  onNavigate={handleNavigate}
  onNewPresentation={handleNewPresentation}
/>
```

**Visual States:**
- Active nav item: `bg-white/[0.08]` with red indicator bar
- Inactive nav item: `text-white/50`, hover `text-white/70`
- Hover effects: `bg-white/[0.04]` and `bg-white/[0.06]`

---

### Template Card Component

**File:** `src/components/TemplateCard.tsx`

Interactive card for displaying template options.

**Features:**
- White background with subtle border
- Hover state with shadow and MOL red title color
- Category badge with color coding
- Metadata display (slide count, version)
- Hidden "Generate Presentation" CTA revealed on hover

**Props:**
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  slideCount: number;
  version: string;
}

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}
```

**Usage:**
```tsx
<TemplateCard
  template={template}
  onSelect={handleTemplateSelect}
/>
```

**Category Badge Mapping:**
```typescript
const CATEGORY_MAP = {
  FINANCIAL: { badge: 'badge-financial' },   // Red
  ESG: { badge: 'badge-esg' },               // Green
  INVESTOR: { badge: 'badge-investor' },     // Blue
  QUARTERLY: { badge: 'badge-quarterly' },   // Orange
  STRATEGY: { badge: 'badge-strategy' },     // Gray
  OPERATIONS: { badge: 'badge-operations' }, // Gray
};
```

---

### Card Styles

```css
/* Base Card */
.card {
  background: white;
  border: 1px solid var(--border-default);
  border-radius: 12px;
  transition: all 0.2s ease;
}

/* Interactive Card */
.card-interactive {
  cursor: pointer;
}

.card-interactive:hover {
  border-color: var(--slate-300);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

---

### Badge Styles

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.025em;
  text-transform: uppercase;
  border-radius: 4px;
}

/* Category-specific badges */
.badge-financial { background: #fef2f2; color: #dc2626; }
.badge-esg { background: #f0fdf4; color: #16a34a; }
.badge-investor { background: #eff6ff; color: #2563eb; }
.badge-quarterly { background: #fff7ed; color: #ea580c; }
.badge-strategy { background: #f8fafc; color: #475569; }
.badge-operations { background: #f8fafc; color: #475569; }
```

---

### Typography Classes

```css
.text-heading {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.text-caption {
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-secondary);
}
```

---

### Buttons

```css
/* Primary Button (MOL Red) */
.btn-primary {
  background: var(--mol-red);
  color: white;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: var(--mol-red-hover);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: var(--mol-red);
  border: 2px solid var(--mol-red);
  border-radius: 4px;
  padding: 10px 22px;
}

/* Sidebar New Button */
.sidebar-new-btn {
  background: var(--mol-red);
  border-radius: 6px;
  width: 100%;
  height: 40px;
}
```

---

### Data Visualization

Use these colors for charts and graphs:

```css
--chart-1: var(--mol-red);      /* #C7423B - Primary metric */
--chart-2: var(--mol-green);    /* #B3C866 - Secondary/eco metric */
--chart-3: var(--mol-tan);      /* #BC8A52 - Tertiary metric */
--chart-4: #5B8DBF;             /* Blue - Additional data */
--chart-5: #8B5CF6;             /* Purple - Additional data */
```

---

## Logo Usage

### Official Logo Assets

**Full Logo (with text):**
- PNG: `https://companieslogo.com/img/orig/MOL.BD_BIG-e423badc.png`
- SVG: `https://companieslogo.com/img/orig/MOL.BD_BIG-cd662588.svg`

**Icon/Symbol Only:**
- PNG: `https://companieslogo.com/img/orig/MOL.BD-c934a47c.png`
- SVG: `https://companieslogo.com/img/orig/MOL.BD-a76d2715.svg`

Source: [CompaniesLogo.com - MOL Group](https://companieslogo.com/molgroup/logo/)

### Clear Space

Maintain minimum clear space around the logo equal to the height of the "M" in MOL.

### Minimum Size

- **Digital**: 80px width minimum
- **Print**: 20mm width minimum

### Don'ts

- ❌ Don't stretch or distort the logo
- ❌ Don't change logo colors outside approved palette
- ❌ Don't place logo on busy backgrounds without container
- ❌ Don't add effects (shadows, gradients, outlines)
- ❌ Don't rotate the logo

---

## Imagery Guidelines

### Photography Style

- **Authentic**: Real people, real situations
- **Dynamic**: Energy and movement
- **Optimistic**: Bright, forward-looking
- **Professional**: High quality, well-composed

### Subject Matter

- Energy infrastructure and operations
- Employees at work
- Customers at service stations
- Sustainability initiatives
- Technology and innovation
- Community engagement

### Image Treatment

- Use 30-degree angle grid for cropping/framing
- Apply brand gradients as overlays when appropriate
- Maintain consistent color grading across campaigns

---

## Accessibility

### Color Contrast

Ensure minimum contrast ratios:
- **Normal text**: 4.5:1
- **Large text**: 3:1
- **UI components**: 3:1

### Text on Colors

| Background | Text Color | Ratio |
|------------|------------|-------|
| MOL Red (#C7423B) | White | ✅ 4.6:1 |
| MOL Green (#B3C866) | Black | ✅ 5.2:1 |
| MOL Tan (#BC8A52) | Black | ✅ 4.1:1 |

---

## Application Examples

### Corporate Communications
- Conservative use of color
- Emphasis on typography and white space
- Professional, trustworthy tone

### Marketing Materials
- Bold use of gradients
- Dynamic imagery
- Energetic, inspiring tone

### Digital Products
- Clean, functional interfaces
- Consistent component library
- Responsive design principles

### Sustainability Communications
- Green color emphasis
- Nature imagery
- Hopeful, action-oriented messaging

---

## Resources

- **Brand Centre**: [new.molgroupbrandcentre.com](https://new.molgroupbrandcentre.com)
- **Corporate Website**: [molgroup.info](https://molgroup.info)
- **Brand Support**: brandsupport@molgroup.info

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial documentation |
| 1.1 | Feb 2026 | Added implemented UI components (Sidebar, TemplateCard), CSS variables, badge system |

---

*This document is intended for AI agents and developers building MOL Group applications. For official brand assets, contact brandsupport@molgroup.info or access the MOL Brand Centre.*
