import React from "react";

const About = () => {
  return (
    <div>
      <h2 className="page">About This Project</h2>
      <p>
        Completed Diary is a full-stack web application built with:
      </p>
      <ul>
        <li>Frontend: React</li>
        <li>Backend: FastAPI</li>
        <li>Database: PostgreSQL</li>
      </ul>
      <p>
        This project demonstrates CRUD operations, API integration,
        and full-stack development.
      </p>
    </div>
  );
};

export default About;