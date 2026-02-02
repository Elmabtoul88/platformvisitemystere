# Client Dashboard & Mission Progress

This section of the application is designed for **Clients**—the business stakeholders who create and monitor mystery shopping missions.

## Key Features

### 1. Client Dashboard (`/client`)

This is the main landing page for a logged-in client. It provides a centralized, at-a-glance overview of all missions associated with their account.

-   **Mission List**: A clear table displaying all of the client's missions.
-   **Mission Status**: Each mission shows its current, real-time status (e.g., "Available," "Assigned," "Completed").
-   **Quick Navigation**: A "View Progress" button for each mission that takes the client directly to the detailed report page.

### 2. Mission Progress View (`/client/missions/[missionId]`)

This is the detailed analysis page for a single mission. Clients can drill down into the data collected by shoppers.

-   **Key Statistics**:
    -   **Submitted Reports**: The number of reports currently awaiting admin approval.
    -   **Approved Reports**: The total number of reports that have been approved and are included in the data analysis.
    -   **Approval Rate**: A percentage showing the ratio of approved reports to the total number of submitted reports, visualized with a progress bar.

-   **Data Table**:
    -   A table listing all **approved** reports for the mission.
    -   For each report, key details are shown, such as the shopper's name, submission date, and crucial answers (like ratings or key text responses).

-   **Data Export**:
    -   Clients can export all the data from the approved reports table into two formats:
        -   **CSV (Excel)**: For use in spreadsheets and other data analysis tools.
        -   **PDF**: For creating printable, shareable documents.

This powerful combination of overview and detailed reporting allows clients to effectively track the performance and results of their mystery shopping campaigns.
