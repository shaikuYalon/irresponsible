import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerLinks}>
                <Link to="/about">אודות</Link>
                <Link to="/contact">צור קשר</Link>
                <Link to="/terms">תנאים והגבלות</Link>
            </div>
            <p>© 2024 Irresponsible. כל הזכויות שמורות.</p>
        </footer>
    );
}

export default Footer;
