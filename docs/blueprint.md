# **App Name**: SchoolCash

## Core Features:

- Student Search: Search for students by ID with auto-fill of name, class, and section.
- Income Entry: Form for entering income details, including student ID, fee type, and amount, which are stored in Firestore.
- Expense Entry: Form for entering expense details, including recipient, category, amount and voucher number, stored in Firestore.
- Daily Register Initialization: Automatically initialize the daily register with the previous day's physical balance as the opening balance, stored in Firestore.
- Real-time Cash Balance Calculation: React Context that provides real-time updates to the cash balance based on incomes and expenses using data pulled from Firestore.
- Day End Reconciliation: Functionality to close the register, compare system-calculated balance with physical cash balance, and record any discrepancies with mandatory notes, stored in Firestore.
- Reporting: Generate reports based on date range and transaction type (income vs expense).

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) for a sense of trust and professionalism.
- Background color: Very light blue (#E8EAF6).
- Accent color: Soft purple (#7E57C2) to highlight key interactive elements and create visual interest.
- Body and headline font: 'Inter', a sans-serif for a modern, neutral look.
- Use clear and professional icons from a library like Material Design Icons, focusing on clarity and ease of understanding.
- Use a clean and organized layout with clear sections for each function, using Tailwind CSS grid and flexbox for responsiveness.
- Subtle transitions and animations to enhance user experience, such as fading in new data or highlighting updated values.