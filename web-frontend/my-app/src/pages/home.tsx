import React from "react";
import { useNavigate } from "react-router-dom";
import { HeaderNav } from "../components/header-nav";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-3">
      <HeaderNav 
        onHomeClick={() => navigate('/')}
        onCameraClick={() => navigate('/scan')}
        onHelpClick={() => console.log('Help clicked')}
      />
      
      <div className="home-page">
        <section className="home-section">
          <h1>EcoPals</h1>
        </section>

        <section className="home-section">
          <p>Welcome to EcoPal, your smart waste management solution!</p>
        </section>

        <section className="home-section">
          <p>Our mission is to help you manage your waste efficiently and sustainably. With BinWise, you can:</p>
        </section>

        <section className="home-section">
          <ul>
            <li>Use smart recognition tools to identify and sort waste.</li>
            <li>Find nearby recycling centers and waste disposal facilities.</li>
          </ul>
        </section>

        <section className="home-section">
          <p>EcoPal can help you make your first steps to big changes.</p>
        </section>
      </div>
    </div>
  );
}
