# PermitPro - Next.js Implementation

A professional permit management system built with Next.js 14, React 18, and Tailwind CSS.

## Features

- **Modern UI/UX**: Clean, professional interface with Tailwind CSS
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Authentication**: Secure JWT-based login system
- **Permit Management**: Create, view, and track permit packages
- **Document Upload**: File management with drag-and-drop interface
- **Status Tracking**: Visual status indicators and workflow management
- **Search & Filter**: Real-time search and filtering capabilities
- **Performance Optimized**: Built with React 18 and Next.js 14

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState/useEffect
- **API**: Custom service layer with fetch

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   Create `.env.local`:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Application**
   Navigate to `http://localhost:3000`

## Project Structure

```
permitpro/
├── app/
│   ├── globals.css          # Global styles
│   ├── layout.js           # Root layout
│   └── page.js             # Main app component
├── components/
│   ├── ui/
│   │   └── index.js        # Reusable UI components
│   ├── LoginPage.js        # Authentication
│   ├── Dashboard.js        # Main dashboard
│   ├── PackageDetailView.js # Package details
│   └── CreatePackageModal.js # New package form
├── lib/
│   └── api.js              # API service layer
└── Configuration files...
```

## Key Components

### LoginPage
- Secure authentication with form validation
- Professional gradient background
- Error handling and loading states

### Dashboard
- Real-time search and filtering
- Statistics cards showing permit counts
- Sortable table with status badges
- Responsive grid layout

### PackageDetailView
- Comprehensive package information display
- Document management with upload functionality
- Status management with visual indicators
- Quick action sidebar

### UI Components
- **Card**: Layout containers with consistent styling
- **Button**: Multiple variants (primary, secondary, outline)
- **Input**: Form inputs with validation states
- **Badge**: Status indicators with color coding
- **Modal**: Overlay dialogs for forms

## API Integration

The application uses a centralized API service (`lib/api.js`) that handles:

- Authentication (login/logout)
- Permit CRUD operations
- Document upload
- Status updates
- Error handling and token management

## Styling

Built with Tailwind CSS featuring:

- Custom color palette with primary blue theme
- Responsive breakpoints
- Consistent spacing and typography
- Professional shadows and borders
- Hover and focus states

## Performance Features

- **React 18**: Latest React features and optimizations
- **Next.js 14**: App Router with improved performance
- **useMemo**: Optimized filtering and search
- **Component Composition**: Reusable UI components
- **Lazy Loading**: Code splitting ready

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Customization

### Adding New Counties
Update the `FLORIDA_COUNTIES` array in `components/CreatePackageModal.js`

### Modifying Status Types
Update status arrays in:
- `components/Dashboard.js` (filtering)
- `components/PackageDetailView.js` (status management)

### Styling Changes
Modify `tailwind.config.js` for theme customization or update component classes directly.

## Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel (recommended for Next.js)
   - Netlify
   - AWS Amplify
   - Custom server

3. **Configure environment variables** on your deployment platform

## Security Considerations

- JWT tokens stored in localStorage
- Input validation on all forms
- API error handling
- HTTPS enforcement recommended
- CORS configuration required for API

## Future Enhancements

- Real-time updates with WebSockets
- Advanced search with full-text indexing
- Bulk operations for permits
- Export functionality (PDF, Excel)
- Mobile app with React Native
- Offline support with service workers

---

Built with ❤️ using Next.js and React
