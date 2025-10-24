# Portfolio Website - Raj Gaurav

A modern, responsive portfolio website with light blue theme featuring About, Resume, Projects, My Work, and Contact sections.

## 🌟 Features

- **Responsive Design** - Works on all devices (desktop, tablet, mobile)
- **Light Blue Theme** - Modern color scheme with animated particles background
- **GitHub Integration** - Automatically fetches and displays repositories
- **Smooth Animations** - Fade-in effects and hover interactions
- **Project Filtering** - Filter projects by public/private visibility
- **Contact Form** - Get in touch section with form validation

## 📁 File Structure

```
portfolio/
├── index.html          # About page (main page)
├── resume.html         # Resume/CV page
├── projects.html       # GitHub projects page
├── mywork.html         # Featured work showcase
├── contact.html        # Contact form page
├── style.css           # Main stylesheet
├── script.js           # Common JavaScript
├── github-projects.js  # GitHub API integration (frontend)
├── github_api.py       # Backend GitHub integration (optional)
└── README.md          # This file
```

## 🚀 Quick Start

### Option 1: Simple Setup (Frontend Only)

1. **Update GitHub Username**
   - Open `github-projects.js`
   - Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username:
   ```javascript
   const GITHUB_USERNAME = 'rajgaurav';
   ```

2. **Add Your Profile Image**
   - Add your profile photo as `profile.jpg` in the same directory
   - Recommended size: 300x300 pixels

3. **Update Personal Information**
   - Edit contact details in each HTML file's sidebar section
   - Update social media links

4. **Open in Browser**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

### Option 2: With Backend API (Recommended)

This option provides better rate limits and more control over data.

1. **Install Dependencies**
   ```bash
   # For Flask
   pip install flask flask-cors requests
   
   # OR for FastAPI
   pip install fastapi uvicorn requests
   ```

2. **Setup Backend**
   - Open `github_api.py`
   - Update your GitHub username
   - (Optional) Add GitHub Personal Access Token for higher API rate limits

3. **Run Backend Server**
   
   **For Flask:**
   ```bash
   python github_api.py
   ```
   
   **For FastAPI:**
   ```bash
   uvicorn github_api:app --reload
   ```

4. **Update Frontend**
   - Modify `github-projects.js` to point to your backend API:
   ```javascript
   const GITHUB_API_URL = 'http://localhost:5000/api/repositories';
   ```

## 🎨 Customization

### Change Colors

Edit `style.css` root variables:

```css
:root {
    --primary-color: #00ff88;      /* Main accent color */
    --secondary-color: #00d4aa;    /* Secondary accent */
    --bg-dark: #0a0e14;           /* Dark background */
    --bg-card: #131920;           /* Card background */
    --bg-hover: #1a2332;          /* Hover state */
}
```

### Modify Content

1. **About Section** (`index.html`)
   - Update bio text
   - Modify skills categories
   - Edit service cards

2. **Resume Section** (`resume.html`)
   - Add/edit education entries
   - Update work experience
   - Modify skills and certifications

3. **Featured Projects** (`mywork.html`)
   - Showcase your best projects
   - Add project descriptions
   - Update technology tags

4. **Contact Form** (`contact.html`)
   - Update contact information
   - Modify form fields
   - Add form submission handler

## 🔧 GitHub API Setup

### Get Personal Access Token (Optional but Recommended)

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo` (for public repos) or `repo` (for private repos)
4. Copy the generated token
5. Add to `github_api.py`:
   ```python
   fetcher = GitHubRepoFetcher(
       username="your-username",
       token="your-token-here"
   )
   ```

**Note:** Without a token, you're limited to 60 requests/hour. With a token: 5000 requests/hour.

## 📱 Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## 🎯 Features Breakdown

### 1. About Page
- Personal introduction
- Skills categorized by proficiency
- Service offerings with icons
- Animated particle background

### 2. Resume Page
- Education timeline
- Work experience with descriptions
- Skills organized by category
- Downloadable resume link
- Professional certifications

### 3. Projects Page
- Auto-fetches from GitHub API
- Filter by public/private
- Shows stars, forks, language
- Links to repository and live demo
- Displays topics/tags

### 4. My Work Page
- Curated featured projects
- Detailed descriptions
- Technology stack badges
- External links

### 5. Contact Page
- Contact form with validation
- Contact information display
- Social media integration
- Response time indicator

## 🛠️ Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla)
- **Icons:** Font Awesome 6.4.0
- **Backend (Optional):** Python (Flask/FastAPI)
- **API:** GitHub REST API v3

## 📝 To-Do Customization Checklist

- [ ] Replace `YOUR_GITHUB_USERNAME` in `github-projects.js`
- [ ] Add profile photo as `profile.jpg`
- [ ] Update all contact information
- [ ] Add social media links
- [ ] Update bio and about text
- [ ] Add education details
- [ ] Add work experience
- [ ] Update skills sections
- [ ] Add featured projects
- [ ] Upload resume PDF
- [ ] Test contact form
- [ ] Test on mobile devices

## 🌐 Deployment

### GitHub Pages
1. Create a new repository
2. Upload all files
3. Go to Settings → Pages
4. Select source: main branch
5. Your site will be at `https://username.github.io/repo-name`

### Netlify
1. Drag and drop your folder to Netlify
2. Or connect your GitHub repository
3. Configure build settings (if using backend)

### Vercel
1. Import your GitHub repository
2. Configure and deploy
3. Automatic deployments on git push

## 📄 License

This portfolio template is free to use for personal and commercial projects.

## 💬 Support

If you need help or have questions:
- Check the code comments
- Review the customization guide above
- Open an issue on GitHub

## 🙏 Credits

Created by Raj Gaurav
- Email: rajneelamgaurav@gmail.com
- Location: Roorkee, Uttrakhand, India

---

**Happy Coding! 🚀**