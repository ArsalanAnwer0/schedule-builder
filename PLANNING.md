# Schedule Builder - Planning Document

## What data do we need 

1. Office Timings:
    - Days
        - Example: M-F
    - Hours
        - Example: 8-4:30
        - Example: 9-5
2. Workers:
    - How many workers to schedule
    - What is each workers availability
3. Requirements:
    - How many total hours to schedule per week?

4. Start and End Date of schedule
    - Example: 12th Jan to May 6th

## What should the output look like
- excel table
    - have name, days column

## More Specific Details

### 1. Worker Availability

### For each worker, we need to know
- Name
- Which days they can work
- What time ranges they can work each day

### Example:
- Arsalan
- Tuesdays, Thursdays
- Tue: 8-12, Thu: 11-4:30

### Hour Distribution:
- Prereq: We need to know how many total hours we have per week
- Balance between hours 
    - Example: 40 hours per week and 7 workers = 5 hours per worker
    - Balance: Different can only be of 1 hour or 1/2 hour
    - Example: 5.5 + 6 + 5.5 + 5.5 + 5.5 + 6 + 6 

### Shift Length:
- Minimum Shift: 2 Hour
- Maximum Shift: 8 Hour

### Edge Case:
- If a student is working 8 hour shift, another student worker needs to be scheduled mid day to cover during other worker break time.

