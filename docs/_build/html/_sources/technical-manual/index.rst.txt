Technical Manual
================

Welcome to the Lakra Technical Manual! This manual is designed for developers, system administrators, and technical users who want to understand, modify, or deploy the Lakra system.

.. note::
   This manual covers the technical architecture, implementation details, and development workflow for Lakra.

Who This Manual Is For
----------------------

* **Developers**: Building new features or modifying existing code
* **System Administrators**: Deploying and maintaining Lakra instances
* **Technical Leads**: Understanding architecture and design decisions
* **Contributors**: Contributing to the Lakra project

Contents
--------

.. toctree::
   :maxdepth: 2

   architecture
   database-schema
   api-reference
   components
   development
   deployment

## Tech Stack Overview

**Frontend:**

* React 19 - UI library
* TypeScript - Type-safe JavaScript
* Vite - Build tool and dev server
* TailwindCSS - Utility-first CSS framework
* React Router - Client-side routing

**Backend:**

* Supabase - Backend-as-a-service
* PostgreSQL - Relational database
* Row Level Security - Database-level access control
* Supabase Auth - Authentication service
* Supabase Storage - File storage for voice recordings

Quick Links
-----------

* :doc:`architecture` - System architecture and design
* :doc:`database-schema` - Complete database schema
* :doc:`api-reference` - API documentation
* :doc:`development` - Development setup and workflow
* :doc:`deployment` - Production deployment guide

Getting Started for Developers
-------------------------------

1. **Clone the repository**
2. **Install dependencies**: ``npm install``
3. **Configure environment**: Set up ``.env`` file with Supabase credentials
4. **Run migrations**: Set up database schema in Supabase
5. **Start dev server**: ``npm run dev``

See the :doc:`development` guide for detailed instructions.

Contributing
------------

We welcome contributions! See the ``CONTRIBUTING.md`` file in the repository root for:

* Code style guidelines
* Branching strategy
* Pull request process
* Testing requirements

Support
-------

For technical support:

* **Issues**: GitHub Issues for bug reports
* **Discussions**: GitHub Discussions for questions
* **Documentation**: This technical manual
* **User Support**: See the :doc:`../user-manual/index` for end-user documentation
