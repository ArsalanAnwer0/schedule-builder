# Schedule Builder

A smart work schedule generator designed for university offices and student worker management. Generate optimized weekly schedules in seconds based on worker availability and office hours.

## Features

- **Smart Scheduling Algorithm**: Generates 3 different schedule options (long, medium, and short shifts)
- **Worker Availability Management**: Define custom availability for each worker by day and time
- **Flexible Configuration**:
  - Set office hours and schedule periods
  - Configure weekly hour targets per worker
  - Optional min/max shift length constraints
- **Easy-to-Remember Times**: All shifts aligned to :00 and :30 boundaries
- **LocalStorage Persistence**: Your data is saved automatically in the browser
- **Semester Presets**: Quick-select common US university semester dates
- **Dark Mode UI**: Modern, clean interface optimized for extended use

## Tech Stack

- **Framework**: Next.js 16.1.0 with React 19
- **Styling**: Tailwind CSS v4 with custom CSS-in-JS
- **Build Tool**: Turbopack
- **Deployment**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/ArsalanAnwer0/schedule-builder.git
cd schedule-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## How to Use

### 1. Configure Office Settings
- Set office operating hours (e.g., 8:00 AM - 4:30 PM)
- Define the schedule period using semester presets or custom dates
- Set weekly hour targets for workers

### 2. Add Workers
- Click "Add Worker" to create worker profiles
- For each worker, specify:
  - Name
  - Days available (Monday-Friday)
  - Time availability for each day

### 3. Generate Schedules
- Click "Generate Schedule" to create 3 optimized options:
  - **Option 1**: Longer shifts (2 workers/day)
  - **Option 2**: Balanced shifts (3 workers/day)
  - **Option 3**: Shorter shifts (4 workers/day)

### 4. Review & Select
- Compare all 3 options
- Review coverage, worker distribution, and hour balance
- Use the schedule that best fits your needs

## Scheduling Algorithm

The algorithm prioritizes:
1. **Full Coverage**: All office hours must be covered
2. **Fair Distribution**: Equal hours for all workers
3. **Worker Availability**: Respects individual availability constraints
4. **Memorable Times**: All shifts start/end at :00 or :30

## Project Structure

```
schedule-builder/
├── app/
│   ├── components/
│   │   └── TimePicker.jsx      # Custom time picker component
│   ├── page.jsx                 # Main application
│   └── globals.css              # Global styles
├── lib/
│   ├── scheduler.js             # Core scheduling algorithm
│   └── utils/
│       └── export.js            # CSV export utilities (archived)
└── PLANNING.md                  # Project requirements
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Author

Built by [Arsalan Anwer](https://github.com/ArsalanAnwer0)

## Acknowledgments

- Designed for university student worker scheduling
- Inspired by real-world office scheduling challenges
