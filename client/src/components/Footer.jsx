import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';
import Modal from './Modal';

function Footer() {
    const [showAboutModal, setShowAboutModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const openAboutModal = () => setShowAboutModal(true);
    const closeAboutModal = () => setShowAboutModal(false);
    const openTermsModal = () => setShowTermsModal(true);
    const closeTermsModal = () => setShowTermsModal(false);

    return (
        <footer className={styles.footer}>
            <div className={styles.footerLinks}>
                <Link to="#" onClick={openAboutModal}>אודות</Link>
                <Link to="/contact">צור קשר</Link>
                <Link to="#" onClick={openTermsModal}>תנאים והגבלות</Link>
            </div>
            <p>© 2024 Irresponsible. כל הזכויות שמורות.</p>

            <Modal show={showAboutModal} onClose={closeAboutModal}>
                <h2>אודות Irresponsible</h2>
                <p>
                    ברוכים הבאים ל-Irresponsible!
                    <br /><br />
                    אם גם אתם, כמוני, ניסיתם להיות חכמים ולשמור על כל הקבלות שלכם בצורה "מוגנת" – אז הסיפור שלי כנראה יישמע לכם מוכר. הייתי בטוח בעצמי: פתחתי קבוצה פרטית בווטסאפ בשם "קבלות ותזכורות", וכל קבלה חדשה נכנסה לשם מיד, מוגנת ובטוחה.
                    <br /><br />
                    יום אחד השואב השוטף שלי התקלקל. בביטחון מלא ובעיניים נוצצות פניתי לאשתי ואמרתי בגאווה: "יש לי את הקבלה, שמרתי אותה בקבוצה בווטסאפ!" – רק שאז גיליתי שלפני כמה חודשים, בניסיון לארגן את הטלפון שלי, מחקתי את התמונה מהגלריה. מה שנשאר בווטסאפ היה כתם מטושטש, שלא יכול להציל אף אחריות.
                    <br /><br />
                    ככה נולד הרעיון ל-Irresponsible – מקום דיגיטלי, אמין ומסודר לשמירת כל הקבלות החשובות, עם תזכורת אוטומטית לפני שתוקף האחריות פג. כי בינינו, מי רוצה להיזכר רק כשהשואב השוטף כבר יצא מכלל שימוש?
                    <br /><br />
                    אז ברוכים הבאים ל-Irresponsible – פתרון בשביל מי שאוהבים להיות "באחריות". כאן נשמור לכם על הקבלות ונזכיר בזמן – כדי שתישארו רגועים.
                </p>
            </Modal>

            <Modal show={showTermsModal} onClose={closeTermsModal}>
                <h2>תנאים והגבלות</h2>
                <p>
                    ברוכים הבאים לאתר Irresponsible. אנו מודים לכם על השימוש באתר ומבקשים לקרוא בעיון את תנאי השימוש לפני השימוש באתר או בשירותים שלנו.
                    <br /><br />
                    <strong>1. קבלת התנאים</strong><br />
                    השימוש באתר Irresponsible כפוף לתנאי השימוש הבאים. על ידי גישה לאתר ושימוש בשירותיו, אתם מאשרים שקראתם, הבנתם והסכמתם לתנאים ולהגבלות אלו. אם אינכם מסכימים לתנאים, אנא הימנעו משימוש באתר.
                    <br /><br />
                    <strong>2. שימוש באתר</strong><br />
                    Irresponsible הוא אתר לניהול ושמירה של קבלות ולתזכור אחריות על מוצרים. האתר אינו אחראי לאובדן קבלות, למידע שגוי, או לשימוש שאינו הולם בשירותים שלנו.
                    אנו שומרים את המידע שהוזן על ידיכם באחריותכם האישית, ואין אנו אחראים על טעויות או שגיאות שעלולות להתרחש.
                    <br /><br />
                    <strong>3. שמירה על פרטיות</strong><br />
                    אנו מחויבים לשמירה על פרטיותכם ומתחייבים לא להעביר מידע אישי לגורמים שלישיים ללא הסכמתכם המפורשת.
                    על המשתמשים להקפיד לשמור על סיסמתם ועל פרטי הגישה שלהם בסודיות, ואנו לא נישא באחריות לכל נזק שייגרם כתוצאה מגישה בלתי מורשית לחשבונם.
                    <br /><br />
                    <strong>4. אחריות מוגבלת</strong><br />
                    האתר מספק תזכורות אוטומטיות בנוגע לאחראויות, אך אינו מתחייב לשלמות או לתקינות התזכורות. על המשתמשים לוודא את נתוני האחריות בעצמם ולא להסתמך באופן מוחלט על תזכורות האתר.
                    Irresponsible אינו אחראי לכל נזק, ישיר או עקיף, שעלול להיגרם בעקבות השימוש באתר.
                    <br /><br />
                    <strong>5. ביטול ושינויים בשירות</strong><br />
                    אנו שומרים לעצמנו את הזכות לבצע שינויים באתר ובתנאי השירות בכל עת וללא הודעה מוקדמת. נודיע על שינויים בתנאים באמצעות פרסום גרסה מעודכנת באתר.
                    <br /><br />
                    <strong>6. סיום השימוש</strong><br />
                    אנו רשאים להפסיק את גישתכם לאתר או לשירותים, לפי שיקול דעתנו הבלעדי, במידה ויש חשד להפרת תנאי השימוש.
                    <br /><br />
                    <strong>7. פניה לשירות לקוחות</strong><br />
                    לכל שאלה, בקשה או בעיה, אנא פנו אלינו דרך דף "צור קשר", ואנו נעשה כמיטב יכולתנו לסייע.
                    <br /><br />
                    <strong>8. מדיניות מחיקת נתונים</strong><br />
                    כל קבלה שנשלחה לאזור "הזבל" תימחק לצמיתות לאחר תקופה של 30 יום. יש לשים לב שאנו לא נוכל לשחזר קבלות שנמחקו.
                    <br /><br />
                    <strong>9. זכויות קניין רוחני</strong><br />
                    כל זכויות הקניין הרוחני באתר שייכות ל-Irresponsible. אין להעתיק, לשכפל, להפיץ או לעשות כל שימוש מסחרי בתוכן האתר ללא אישור מפורש מאיתנו.
                    <br /><br />
                    אנו מודים לכם על השימוש ב-Irresponsible ומאחלים לכם חוויית שימוש נוחה ונעימה.
                </p>
            </Modal>
        </footer>
    );
}

export default Footer;
