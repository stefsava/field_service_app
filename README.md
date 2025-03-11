# Field Service App (Rails + Stimulus)

Field Service App is a **Rails 8** application with **Stimulus.js**, designed for offline management of work orders synchronized with **Odoo**. It uses **IndexedDB** for local data storage and **Service Worker** for offline support.

## 🚀 Key Features

- **Work order and intervention management**: synchronized with Odoo.
- **Offline-first approach**: data is stored in IndexedDB and synced when online.
- **Mobile-first interface**: built with **Bootstrap 5.3**.
- **Service Worker support**: for caching and offline usage.
- **Rails 8 standard authentication** with Turbo and Stimulus.
- **Integration with Odoo API** using **xmlrpc**.

## 📦 Installation

### 1️⃣ Prerequisites

- **Ruby** 3.x
- **Rails** 8
- **PostgreSQL** (optional, if used as a DB)
- **Docker** (if you want to use a containerized setup)
- **Node.js** and **Importmap** for JS management (without npm!)

### 2️⃣ Clone the repository

```sh
git clone https://github.com/stefsava/field_service_app.git
cd field_service_app
```

### 3️⃣ Install dependencies

```sh
bundle install
```

### 4️⃣ Set up the database

```sh
bin/rails db:create db:migrate db:seed
```

### 5️⃣ Start the server

```sh
bin/dev
```

Or with Docker:

```sh
docker-compose up --build
```

## 🔌 Configuration

Modify the `.env.sample` file, rename it to `.env`, and set the correct parameters for Odoo and the database connection.

## 🛠️ Technologies Used

- **Rails 8** with Importmap (no Webpack)
- **Stimulus.js** for dynamic UI management
- **Turbo Streams** for real-time updates
- **Bootstrap 5.3** for responsive design
- **IndexedDB** for offline data storage
- **Service Worker** for caching and offline functionality
- **Odoo API (xmlrpc)** for data synchronization

## 📌 Roadmap

- [x] Synchronization with Odoo
- [x] Offline support with IndexedDB
- [x] Responsive UI with Bootstrap 5.3
- [ ] Conflict resolution between offline and online data
- [ ] Push notifications for updates
- [ ] Performance optimizations

## 🤝 Contributions

If you'd like to contribute, feel free to open an **Issue** or a **Pull Request**! 🛠️

## 📄 License

This project is the exclusive property of the author. Redistribution, modification, or use is not permitted without explicit authorization.

## 📧 Contact

If you are interested in this project or need more information, feel free to contact me via email at **[stefano@savanelli.it]**.
I’d be happy to answer questions, discuss collaborations, or provide technical support. 🚀
