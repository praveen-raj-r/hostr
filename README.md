# HOSTR  
Event Management Platform for Organizers and Attendees

🔗 **Live Demo:** https://hostr-ai.vercel.app/

## Overview

HOSTR is a full-stack event management platform designed to simplify how events are created, discovered, managed, and attended. The application focuses on real-world workflows for organizers and users, combining secure authentication, structured data modeling, and scalable frontend architecture.

The project emphasizes production-style system design and end-to-end feature ownership, similar to modern SaaS applications.

---

## Problem Space

Event management workflows are often fragmented across tools, leading to:

- High setup time for organizers  
- Poor discovery and registration experience for users  
- Limited visibility into registrations and attendance  

HOSTR addresses these challenges by providing a unified platform for event creation, registration, and attendee management.

---

## Core Features

### Event Creation & Management
- Create and manage events with structured metadata
- Capacity and registration handling
- Organizer-focused management views

### Event Discovery & Registration
- Browse and explore events by category and location
- SEO-friendly event detail pages
- Smooth registration flow for attendees

### User Accounts & Dashboards
- Secure authentication and protected routes
- Personalized dashboards for hosted and registered events
- Persistent ticket access

### Ticketing & Check-In
- Unique QR-based tickets per attendee
- Organizer check-in flow for attendance tracking

---

## Architecture Overview

HOSTR follows a modern full-stack SaaS architecture:

- **Frontend-first design** using Next.js App Router and React
- **Component-driven UI** with reusable patterns
- **Backend-as-a-service** for structured data access and real-time updates
- **Decoupled authentication layer**
