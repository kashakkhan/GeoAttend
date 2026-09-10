# 📍 GeoAttend – Smart Attendance Management System

## 📌 Project Overview

**GeoAttend** is a smart, cloud-based attendance management system designed to simplify and automate attendance tracking for educational institutions.

The system provides a centralized platform for managing **students, teachers, class timetables, attendance records, and schedules**. It is designed around a **Function-as-a-Service (FaaS)** architecture, allowing backend operations to be executed through serverless functions without the need to maintain traditional backend servers.

The project aims to make attendance management more **efficient, reliable, scalable, and accessible** while reducing manual attendance-related work for teachers and administrators.

---

## 🎯 Objectives

- 📋 Digitize and simplify the attendance management process.
- 👨‍🏫 Allow teachers to manage and record student attendance efficiently.
- 👨‍🎓 Maintain organized student attendance records.
- 🗓️ Manage class timetables and teacher schedules.
- 👩‍🏫 Support class-teacher and subject-wise schedule management.
- ☁️ Utilize cloud-based and serverless technologies for backend operations.
- 🔐 Provide secure authentication and controlled access to system features.
- 📊 Make attendance information easier to monitor and manage.

---

## ✨ Key Features

### 👨‍🎓 Student Management

- Student information management.
- View attendance records.
- Access class and timetable information.
- Track attendance status.

### 👨‍🏫 Teacher Management

- Teacher authentication and access.
- View assigned classes and subjects.
- Manage attendance for respective classes.
- Access teaching schedules and timetables.

### 🗓️ Timetable & Schedule Management

The system provides timetable-based organization of academic activities.

It can be used to manage:

- Class schedules
- Subject schedules
- Teacher schedules
- Class-teacher assignments
- Period-wise academic activities

This helps ensure that attendance is associated with the appropriate **class, subject, teacher, and scheduled period**.

### 📍 Attendance Management

GeoAttend is designed to provide a structured approach to attendance recording.

Attendance data can be associated with relevant class and schedule information, helping maintain accurate and organized attendance records.

### ☁️ Serverless Architecture

The backend functionality follows a **Function-as-a-Service (FaaS)** approach.

Instead of relying on a continuously running traditional server, individual backend operations can be handled through serverless functions.

This provides benefits such as:

- Scalability
- Reduced server management
- Event-driven execution
- Efficient resource utilization
- Easier deployment and maintenance

---

## 🏗️ System Architecture

The project follows a modern web and serverless architecture:

```text
                 ┌──────────────────────┐
                 │      User / Client   │
                 │  Students & Teachers │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │     Next.js Frontend │
                 │   Web Application    │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Serverless / FaaS  │
                 │      Functions       │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │      Supabase        │
                 │ Authentication + DB  │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │ Attendance / Student │
                 │ Teacher / Timetable  │
                 │       Records        │
                 └──────────────────────┘
