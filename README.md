# JocrisFit - Personal Training Landing Page

![JocrisFit Landing Page](readme_images/jocrisfit_landing_page.png)

## 🏋️ About This Project

This is a modern, responsive landing page built for a personal training client who specializes in personalized fitness coaching and body transformations. The website showcases the trainer's services, client transformations, and provides an easy way for potential clients to get in touch.

## ✨ Features

### 🎯 Core Functionality
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Contact Form**: Integrated contact form with email notifications
- **Instagram Integration**: Real-time Instagram post display with image proxy
- **Client Transformations**: Showcase section for before/after results
- **Service Offerings**: Detailed information about training programs

### 🔧 Technical Features
- **Real Instagram API**: GraphQL-based Instagram scraping with 24-hour caching
- **Image Proxy**: CORS-compliant image serving for Instagram content
- **Email Integration**: Contact form powered by Resend API
- **Anti-Spam Protection**: Cloudflare Turnstile integration
- **SEO Optimized**: Meta tags, structured data, and performance optimized
- **Privacy Compliant**: GDPR-compliant privacy policy and terms of service

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) - Modern static site generator
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Language**: TypeScript for type safety
- **Email Service**: [Resend](https://resend.com/) for contact form emails
- **Anti-Spam**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- **Instagram API**: Custom GraphQL implementation with caching
- **Deployment**: Optimized for Vercel deployment

## 📁 Project Structure

```text
/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── logo.webp
│   └── *.webp             # Optimized images
├── src/
│   ├── components/         # Reusable Astro components
│   │   ├── Header.astro
│   │   ├── Hero.astro
│   │   ├── About.astro
│   │   ├── Services.astro
│   │   ├── Transformations.astro
│   │   ├── Contact.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Layout.astro    # Main layout template
│   ├── pages/
│   │   ├── api/            # API endpoints
│   │   │   ├── contact.ts  # Contact form handler
│   │   │   ├── instagram.ts # Instagram data API
│   │   │   └── instagram-image.ts # Image proxy
│   │   ├── index.astro     # Homepage
│   │   ├── privacidad.astro # Privacy policy
│   │   └── terminos.astro  # Terms of service
│   ├── styles/             # CSS files
│   └── types/              # TypeScript definitions
└── readme_images/          # Documentation assets
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### 1. Clone the repository
```bash
git clone <repository-url>
cd jocrisfit-landing-page
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and configure the following variables:

```env
# Email Configuration (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
CONTACT_EMAIL=your_email@example.com

# Anti-spam Protection (Cloudflare Turnstile)
TURNSTILE_SECRET_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxxxxxxxxxx
PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxxxxxxxxxx

# Instagram Configuration
USER_AGENT=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36
X_IG_APP_ID=936619743392459
INSTAGRAM_CACHE_DURATION=1440  # 24 hours in minutes
```

### 4. Start development server
```bash
npm run dev
```

The site will be available at `http://localhost:4321`

## 📧 Email Setup (Resend)

1. Sign up at [Resend](https://resend.com/)
2. Create an API key
3. Verify your sending domain/email
4. Add the API key to your `.env` file

## 🔒 Anti-Spam Setup (Cloudflare Turnstile)

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to Turnstile
3. Create a new site
4. Copy the Site Key and Secret Key to your `.env` file

## 📱 Instagram Integration

The Instagram integration uses a custom GraphQL implementation that:
- Fetches real Instagram post data
- Caches responses for 24 hours
- Serves images through a CORS-compliant proxy
- Displays likes, comments, and captions
- Opens posts in a beautiful modal

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Build
```bash
npm run build
npm run preview
```

## 🧞 Available Commands

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 🎨 Customization

### Colors & Branding
Update the color scheme in `tailwind.config.mjs`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#your-primary-color',
      secondary: '#your-secondary-color',
    }
  }
}
```

### Content
- Update trainer information in `src/components/About.astro`
- Modify services in `src/components/Services.astro`
- Add transformation images in `src/components/Transformations.astro`
- Update contact information in `src/components/Contact.astro`

## 📊 Performance Features

- **Image Optimization**: WebP format with lazy loading
- **Caching Strategy**: 24-hour cache for Instagram data and images
- **Minimal JavaScript**: Astro's island architecture for optimal performance
- **SEO Optimized**: Meta tags, Open Graph, and structured data
- **Mobile First**: Responsive design with mobile-first approach

## 🔧 API Endpoints

- `POST /api/contact` - Contact form submission
- `GET /api/instagram` - Instagram posts data
- `GET /api/instagram-image` - Instagram image proxy

## 📄 Legal Pages

- `/privacidad` - Privacy Policy (Spanish)
- `/terminos` - Terms of Service (Spanish)


## 📞 Support

For technical support or questions about this project, please refer to the project documentation or contact the development team.

---

**Built with ❤️ using Astro, TypeScript, and Tailwind CSS**
