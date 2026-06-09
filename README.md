# GSoC Leaderboard

A simple, open-source leaderboard for Google Summer of Code organizations.

The goal of this project is to help new contributors quickly understand the activity level of different organizations by showing contributor statistics such as pull requests, merged pull requests, and issues.

## Why was this created?

When exploring organizations for Google Summer of Code, it can be difficult to estimate:

* How active an organization is
* How many contributors are involved
* How many pull requests are being merged

This project aims to make that information easier to discover through a simple and transparent interface.

## Features

* Organization-specific leaderboards
* Pull request statistics
* Merged pull request statistics
* Issue statistics
* Search organizations
* Open-source and transparent data collection

## Data Updates

Leaderboard data is updated every **6 hours**.

This update interval exists because GitHub's API has rate limits, and updating too frequently would quickly exhaust the available quota.


## Open Source & Transparency

This project is completely open source.

The source code, data collection scripts, and deployment configuration are publicly available so that anyone can inspect how the data is gathered and displayed.

Transparency is an important goal of this project.

## Contributing

Contributions of all sizes are welcome.

Whether you want to:

* Fix a bug
* Improve the UI
* Add support for a new platform
* Improve data collection
* Add a new organization
* Improve documentation

feel free to open an issue or submit a pull request.

### Getting Started

Clone the repository:

```bash
git clone https://github.com/Anxhul10/gsoc-leaderboard.git
cd gsoc-leaderboard
```

Install dependencies:

```bash
yarn
```

Start the development server:

```bash
yarn dev
```

Open:

```txt
http://localhost:3000
```

## Adding an Organization

If you would like an organization to be added to the leaderboard, please open an issue describing the organization and its source code hosting platform.

If you'd like to implement support yourself, pull requests are welcome.

## Feedback

Found a bug?

Have an idea for improvement?

Please open an issue and let us know.
