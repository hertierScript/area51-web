## Project Summary
Area 51 is a cross-platform (web-first) restaurant meal delivery application designed with a high-tech, extraterrestrial aesthetic. It allows users to browse a "classified" menu of unique food items, add them to a mission log (cart), and initiate a delivery mission.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4 with OKLCH colors
- **Components**: Radix UI (via shadcn/ui)
- **Icons**: Lucide React
- **Motion**: Framer Motion
- **Theme**: next-themes (Light/Dark mode)

## Architecture
- `src/app/`: Core page and layout configuration.
- `src/components/`: Reusable UI components (Navbar, Hero, Menu).
- `src/components/ui/`: Low-level primitive components.
- `src/hooks/`: Custom hooks for state management (e.g., `use-cart`).
- `src/lib/supabase.ts`: Supabase client and database types.
- `src/app/globals.css`: Theme variable definitions and global styles.

## Database Schema
- **categories**: Menu item categories (Burgers, Pizza, Sides, Drinks)
- **menu_items**: Food items with name, description, price, image, availability
- **orders**: Customer orders with delivery info and status
- **order_items**: Line items linking orders to menu items

## User Preferences
- **Theme**: Prefers a Green and Black color scheme matching the brand logo.
- **Mode**: Supports both Light and Dark modes with a toggle functionality.

## Project Guidelines
- Maintain the "Classified/Alien" theme in copywriting and UI elements.
- Use bright neon green (`oklch(0.868 0.284 145.4)`) as the primary accent color.
- Ensure the app is responsive and looks like a native mobile app on small screens.

## Common Patterns
- Interactive elements should have subtle glowing effects (shadow-primary).
- Use `framer-motion` for entrance animations (staggered fades and slides).
- Cart state is managed via a custom hook and displayed in a side drawer (Sheet).
