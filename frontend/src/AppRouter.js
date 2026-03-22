import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Homepage from './pages/Homepage';
import ProductPage from './pages/ProductPage';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import LocationPage from './pages/LocationPage';
import SearchResults from './pages/SearchResults';
import './theme.css';
import './App.css';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/:state/:city?" element={<LocationPage />} />
      </Routes>
    </Router>
  );
}

export default App;