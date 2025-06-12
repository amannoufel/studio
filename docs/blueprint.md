# **App Name**: Tenant Tracker

## Core Features:

- New Complaint Submission: Tenant login and submission of a new maintenance request with details such as building, flat number, contact information, preferred time, category of issue, and description.
- Complaint Status Tracking: Display all open and historical maintenance requests linked to the logged-in tenant. Show the real-time status of each request (e.g., pending, attended, completed).
- Complaint Dashboard: Display all submitted complaints and allow the filtering of complaints by date, status, and building to help prioritize them. From this table, the admin can navigate to the View Details page.
- Complaint Details View: Admin view to see the full details of the complaint along with its job history and an update job form.
- Job Update Form: Form for updating job details such as date/time attended, staff involved, job card number, materials used, time completed, and status (completed, not completed, or tenant not available).
- Automatic Complaint Duplication: On submission of a job update (with outcome not completed) this will generate a duplicate complaint for resolution and sets the old complaint to a closed status with the relevant reason for closure.

## Style Guidelines:

- Primary color: Deep Indigo (#6639A6) to give the app a professional, organized feel, hinting at efficiency and reliability.
- Background color: Light Gray (#F0F0F5), for a clean and modern aesthetic that ensures readability and minimizes distraction.
- Accent color: Electric Purple (#8932A8), used for interactive elements and highlights to draw user attention without overwhelming the interface.
- Body and headline font: 'Inter', sans-serif, providing a clean and modern appearance, as well as excellent legibility on a variety of screen sizes and resolutions.
- Use Font Awesome for key actions such as adding, editing, and deleting, following a minimalist aesthetic to ensure clarity.
- Maintain a consistent layout across all pages, utilizing Bootstrap's grid system for responsiveness. Keep content blocks organized and spaced effectively for improved readability and user navigation.
- Subtle transitions to improve the navigation flow. For example, incorporate slight fades or slides when transitioning between pages or when displaying new information, ensuring a smooth user experience.