import React , { useState ,useEffect} from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../assets/stylesManager/KitchenOrder.css';
//------------PDF-------------------------------------
import html2pdf from 'html2pdf.js';
//-------------איקונים-------------------------------
import { BsWhatsapp } from "react-icons/bs";
import { MdLocalPrintshop } from "react-icons/md";
import { BiLogoGmail } from "react-icons/bi";
import { MdDownload } from "react-icons/md";
import { BsFiletypePdf } from "react-icons/bs";
import { TbArrowBadgeDown } from "react-icons/tb";
import { FaPhoneSquareAlt } from "react-icons/fa";
import { MdPeopleAlt } from "react-icons/md";

const KitchenOrder = () => {
  const location = useLocation();
  const { orderSummary, eventDate, guestCount, totalPrice, eventOwner, phoneNumber } = location.state || {};
  const name = "ארוגטי";
   const EventDate = new Date(eventDate).toLocaleDateString('he-IL');
 const [parsedOrderMenu,setParsedOrderMenu]= useState( orderSummary[0] && JSON.parse(orderSummary[0].order_menu));// משתנה התפריט

 const [ModalOpenOfWhatsApp, setModalOpenOfWhatsApp] = useState(false); // מודול שליחה וואצאפ
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // מודול עריכת מנה 
   const [dishToDelete, setDishToDelete] = useState(null);// מודול מחיקת מנה
  const [editAddDish,setEditAddDish] = useState(false);

  const [newDish, setNewDish] = useState({ // מנה החדשה
    dish_name: "",
    price: "",
    weight: "",
    category: "",  
     selectedDish: '', 
  });
  const [allDishes, setAllDishes] = useState([]);  // כל המנות שיגיעו מהשרת
  const [menuCategories, setMenuCategories] = useState([]);
  const [editDishData, setEditDishData] = useState({ //  מנה לעדכון
    dish_name: '',
    price: '',
    weight: '',
  });
 
 // קריאה לשרת לקבלת התפריט הכללי
  useEffect(() => {
    const fetchAllDishes = async () => {
      try {
        const response = await fetch('http://localhost:3001/inventoryAll');
        const data = await response.json();
        setAllDishes(data);
      } catch (error) {
        console.error('Error fetching dishes:', error);
      }
    };

    fetchAllDishes();
  }, []);


  if (!orderSummary) {
    return <div>לא נשלחו נתונים להצגה.</div>;
  }
 

             /* הוספת מנה לתפריט*/
    const handleAddDish = async () => {
    try {
      const response = await axios.post('http://localhost:3001/KitchenOrder/addDish', {
        dish_name: newDish.dish_name,
        price: newDish.price,
        weight: newDish.weight,
        category: newDish.category,
        selectedDish: newDish.selectedDish,  // מנה שנבחרה
        user_id: orderSummary[0].user_id,
      });
      if (response.status === 200) {
        alert('המנה נוספה בהצלחה!');
        setNewDish({ dish_name: '', price: '', weight: '', category: '', selectedDish: '' });
        setParsedOrderMenu((prevMenuData) => ({
          ...prevMenuData,
          [newDish.category]: [
            ...(prevMenuData[newDish.category]),
            {
              dish_name: newDish.dish_name,
              totalPrice: newDish.price,
              totalWeight: newDish.weight,
            },
          ],
        }));
      }
    } catch (error) {
      console.error('Error adding dish:', error);
    }
  };

    
         /*     מחיקת מנה קיימת'     */
   const handleDeleteDish = async () => {
    try {
      const response = await axios.delete(`http://localhost:3001/KitchenOrder/deleteDish`, {
        data: {
          dish_name: dishToDelete, 
          user_id: orderSummary[0].user_id
        }
      });
      if (response.status === 200) {
        alert('המנה נמחקה בהצלחה!');
        setDishToDelete(null);

        setParsedOrderMenu((prevMenuData) => { // מחיקה מהסטייט
          const updatedMenu = { ...prevMenuData };
          for (let category in updatedMenu) {  // עובר על כל הקטגוריות ומסנן את המנה
            updatedMenu[category] = updatedMenu[category].filter(dish => dish.dish_name !== dishToDelete);
          }
          return updatedMenu;
        });
      }
    } catch (error) {
      console.error('Error deleting dish:', error);
    }
  };


         /*     עדכון מנה קיימת    */
    const handleUpdateDish = async () => {
     try {
       const { dish_name, price, weight } = editDishData;
   
       const response = await axios.put("http://localhost:3001/KitchenOrder/updateDish", {
         dish_name: dish_name,
         price: price,
         weight: weight,
         user_id: orderSummary[0].user_id
       });
   
       if (response.status === 200) {
         alert('המנה עודכנה בהצלחה!');
         setIsEditModalOpen(false);
   
         // עדכון הסטייט של התפריט לאחר העריכה
         setParsedOrderMenu((prevMenuData) => {
           const updatedMenu = { ...prevMenuData };
   
           // עוברים על כל הקטגוריות ומעדכנים את המנה
           for (let category in updatedMenu) {
             const dishIndex = updatedMenu[category].findIndex(dish => dish.dish_name === dish_name);
             if (dishIndex !== -1) {
               // עדכון המחיר והמשקל של המנה
               updatedMenu[category][dishIndex].totalPrice = price;
               updatedMenu[category][dishIndex].totalWeight = weight;
               break;
             }
           }
   
           return updatedMenu;
         });
       }
     } catch (error) {
       console.error('Error updating dish:', error);
     }
   };
         

  
  



     /*   פתיחת מודול עריכת מנה   */
const handleShowEditModal = (dish_name, price, weight) => {
  setEditDishData({ dish_name, price, weight });
  setIsEditModalOpen(true);
};


   /* פתיחת מודול מחיקה   */
const handleShowDeleteConfirmation = (id) => {
  setDishToDelete(id);
};


  // פונקציה ליצירת PDF עבור המטבח
  const handleCreatePDF = (isForKitchen = false) => {
    const options = {
      margin: 10,
      filename: `${name}_Order_${isForKitchen ? 'Kitchen' : 'Full'}.pdf`,
      html2canvas: { scale: 4 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    };

    let content = `
      <h2 style="text-align: center; font-weight: bold;">${isForKitchen ? 'ארוגטי <br/> הזמנה למטבח' : 'אולמי הפנינה'}</h2>
      <div style="font-size: 20px; text-align: center;  font-weight: bold;">תאריך האירוע: ${EventDate}</div>
      <div style="font-size: 20px; text-align: center;  font-weight: bold;">${isForKitchen ? " " : `שם בעל האירוע : ${eventOwner}`}</div>
    `;
          // עבור כל קטגוריית מנות, הצגת המנות המתאימות
    const renderMenu = (category) => {
      let categoryContent = `
        <h4 style="text-align: center;">${category === 'salads' ? 'סלטים' :
          category === 'first_courses' ? 'מנות ראשונות' :
          category === 'main_courses' ? 'מנות עיקריות' : 'תוספות'}</h4>
        <table dir="rtl" style="width: 100%; border: 1px solid black; border-collapse: collapse;">
          <thead>
            <tr>
              <th style="border: 1px solid black; padding: 8px; text-align: center;">שם המנה</th>
              ${isForKitchen ? '' : '<th style="border: 1px solid black; padding: 8px; text-align: center;">מחיר המנה</th>'}
              <th style="border: 1px solid black; padding: 8px; text-align: center;">משקל כולל</th>
            </tr>
          </thead>
          <tbody>
      `;
      parsedOrderMenu[category].forEach(item => {
        categoryContent += `
          <tr>
            <td style="border: 1px solid black; padding: 8px; text-align: center;">${item.dish_name}</td>
            ${isForKitchen ? '' : `<td style="border: 1px solid black; padding: 8px; text-align: center;">${item.totalPrice}</td>`}
            <td style="border: 1px solid black; padding: 8px; text-align: center;">
              ${item.totalWeight > 1000 ? `${(item.totalWeight / 1000).toFixed(2)} קילו` : `${parseInt(item.totalWeight)} יחידות`}
            </td>
          </tr>
        `;
      });
      categoryContent += '</tbody></table><br />';
      return categoryContent;
    };
      // דאג להוסיף את כל המנות (לפי קטגוריות)
    if (parsedOrderMenu) {
      Object.keys(parsedOrderMenu).forEach(category => {
        content += renderMenu(category);
      });
    }
     // המרת התוכן ל-PDF
    html2pdf().from(content).set(options).save();
  };

// שליחה במייל
  const handleShareEmail = () => {
    handleCreatePDF(); // יצירת PDF לפני שליחה
    const subject = `הזמנה עבור ${name}`;
    const body = `תאריך האירוע: ${EventDate}\nמספר אורחים: ${guestCount}\nפרטי ההזמנה (הקובץ מצורף);`;
    window.location.href = `mailto:elyasaf852@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
// -----------------------------------------------------------------------
// שליחה בווטסאפ
  const handleShareWhatsApp = () => {
    setModalOpenOfWhatsApp(true);
  };
 const phoneNumbers = [
    '  972546600200 אבא', // דוגמה, הכנס מספרים אמיתיים
    '972553069666 מטבח', 
    '972523456789 נריה',
  ];
  const handlePhoneSelection = (phoneNumber) => { 
    handleCreatePDF(true); // יצירת PDF לפני שליחה
    const message = `הזמנה עבור ${name}\nתאריך האירוע: ${EventDate}\nמספר אורחים: ${guestCount}\n\nפרטי ההזמנה (הקובץ מצורף)`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
    setModalOpenOfWhatsApp(false);  // סגור את המודאל אחרי שליחה
  };
  //-------------------------------------------------------------------------
  const handleCreatePrint = () => {
    window.print();
  }
 

  return (
    <div className="kitchen-order-container" dir="rtl"> 
    <button className='button-add-dish' onClick={ () => setEditAddDish(!editAddDish)}>הוספת מנה חדשה </button>
      <div className="kitchen-order-info">
        <div className='kitchen-order-header'>
        <h1>אולמי הפנינה</h1>
        <p>שם המזמין: {eventOwner || 'לא זמין'}</p>
        <p>תאריך האירוע: {EventDate}</p>
        <p>מספר אורחים: <MdPeopleAlt/> {guestCount}</p>
        <p>מספר פלאפון: <FaPhoneSquareAlt/> {phoneNumber}</p>
        <p>סה"כ מחיר: ₪ {totalPrice || 'לא זמין'}</p>  
        </div>
    {/* הוספת מנה מודול*/}
 {editAddDish && (
<div className="add-dish">
<h3>הוסף מנה חדשה</h3>  
  <select
      onChange={(e) => setNewDish({ ...newDish, category: e.target.value })}
        value={newDish.category}
      >
        <option value="">בחר קטגוריה</option>
        <option value="salads">סלטים</option>
        <option value="first_courses">מנות ראשונות</option>
        <option value="main_courses">מנות עיקריות</option>
        <option value="side_dishes">תוספות</option>
      </select>
  {/* הצגת המנות לפי הקטגוריה */}
  <select
      onChange={(e) => {
        const selectedDish = e.target.value;
        setNewDish({ ...newDish, selectedDish, dish_name: selectedDish }); // עדכון שם המנה הנבחרת
      }}
      value={newDish.selectedDish}
    >
     <option value="">בחר מנה מהתפריט הכללי</option>
      {newDish.category &&
        allDishes[newDish.category] &&
        allDishes[newDish.category].map((dish) => (
          <option key={dish.dish_name} value={dish.dish_name}>
            {dish.dish_name}
          </option>
        ))}
    </select>

      <input
        type="number"
        placeholder="מחיר המנה"
        value={newDish.price}
        onChange={(e) => setNewDish({ ...newDish, price: e.target.value })}
      />
      <input
        type="number"
        placeholder="משקל המנה"
        value={newDish.weight}
        onChange={(e) => setNewDish({ ...newDish, weight: e.target.value })}
      />
    

 <p>תזכורת: מנהל המוסיף מנה לתפריט המנה לא תעבור חישוב לפי מספר המוזמנים</p>
 <p>עלייך לוודא את החישוב כרצונך עבור המנה </p>
  <button onClick={handleAddDish} className="add-button">הוסף מנה</button>
</div>
)}
 



<br />
        {parsedOrderMenu && Object.keys(parsedOrderMenu).map((category) => (
          <div key={category} className="kitchen-order-category">
            <h4 className="kitchen-order-category-title">
              {category === 'salads' ? 'סלטים' :
               category === 'first_courses' ? 'מנות ראשונות' :
               category === 'main_courses' ? 'מנות עיקריות' : 'תוספות'}
            </h4>
            <table className="kitchen-order-table">
              <thead>
                <tr>
                  <th>שם המנה</th>
                  <th>מחיר המנה </th>
                  <th>משקל כולל</th>
                  <th  >עריכה</th>
                  <th >מחיקה</th>
                </tr>
              </thead>
              <tbody>
                {parsedOrderMenu[category].map((item, index) => (
                  <tr key={`${item.dish_name}-${index}`}>
                    <td>{item.dish_name}</td>
                    <td>{item.totalPrice}</td>
                    <td>{item.totalWeight > 1000 ? `${(item.totalWeight / 1000).toFixed(2)} קילו` : `${parseInt(item.totalWeight)} מנות`}</td>
                    <td>
                    <button className='kitchen-order-edit-button' onClick={() => handleShowEditModal(item.dish_name, item.totalPrice, item.totalWeight)}>ערוך</button>
                    </td>
                    <td>
                    <button className='kitchen-order-delete-button' onClick={() => handleShowDeleteConfirmation(item.dish_name)}>מחק</button>
                    </td>
                
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <label className='kitchen-order-label-button'><TbArrowBadgeDown/> מנהל <TbArrowBadgeDown/></label>
      <br />
      <div className="kitchen-order-actions"> 
        <button className="kitchen-order-action-button" onClick={() => handleCreatePDF(false)}  title="הורד סיכום הזמנה למחשב "><MdDownload />הורד</button>
        <button className="kitchen-order-action-button" onClick={() => handleCreatePrint()} title="הדפס סיכום הזמנה"><MdLocalPrintshop />הדפס</button>
        <hr />
        </div>
        <label className='kitchen-order-label-button'><TbArrowBadgeDown/> מטבח <TbArrowBadgeDown/></label>
        <br />
        <div className="kitchen-order-actions">
        <button className="kitchen-order-action-button" onClick={() => handleShareEmail()} title='שליחה למטבח'><BiLogoGmail /> שלח במייל</button>
        <button className="kitchen-order-action-button" onClick={() => handleShareWhatsApp()}title='שליחה בוואצאפ למטבח'><BsWhatsapp /> שלח וואצאפ</button>
        <button className="kitchen-order-action-button" onClick={() => handleCreatePDF(true)} title='הורד סיכום למטבח'><BsFiletypePdf /> הורד סיכום מטבח</button>
        </div>

 


 {/* מודל עריכה */}
 {isEditModalOpen && (
        <div className="whatsapp-modal-container">
          <div className="modal-edit-kitchen-orders">
            <h3>ערוך את המנה</h3>
            <label className='whatsapp-modal-list'>שם המנה: {editDishData.dish_name}</label><br /><br />
            <label className='whatsapp-modal-list'>עדכון מחיר הכולל</label>
            <input className='kitchen-order-edit-form-input'
              type="number"
              placeholder="עדכון מחיר"
              value={editDishData.price}
              onChange={(e) => setEditDishData({ ...editDishData, price: e.target.value })}
            /> 
            <label className='whatsapp-modal-list'>עדכון משקל :<br/>  אם מדובר בגרמים כתוב כך : <br/> לדוגמה 7 קילו כתוב 70000</label>
            <input className='kitchen-order-edit-form-input'
              type="number"
              placeholder="עדכון משקל"
              value={editDishData.weight}
              onChange={(e) => setEditDishData({ ...editDishData, weight: e.target.value })}
            />
            <div className='modal-edit-kitchen-orders-close'>
            <button onClick={handleUpdateDish}>עדכן</button>
            <button onClick={() => setIsEditModalOpen(false)}>סגור</button>
            </div>
          </div>
        </div>
      )}

 {/* מודל אישור מחיקה */}
 {dishToDelete && (
        <div className="whatsapp-modal-container">
          <div className="modal-edit-kitchen-orders">
            <h3>האם אתה בטוח שברצונך למחוק את המנה?</h3>
            <div className='modal-edit-kitchen-orders-close'>
            <button onClick={handleDeleteDish}>אישור</button>
            <button  onClick={() => setDishToDelete(null)}>סגירה</button>
            </div>
          </div>
        </div>
      )}


{ModalOpenOfWhatsApp && (
  <div className="whatsapp-modal-container">
    <div className="whatsapp-modal">
      <h3 className="whatsapp-modal-title">בחר את מספר הטלפון לשליחה בוואצאפ</h3>
      <ul className="whatsapp-modal-list">
        {phoneNumbers.map((number, index) => (
          <li key={index} className="whatsapp-modal-item">
            <button onClick={() => handlePhoneSelection(number)}className="whatsapp-modal-button"  > 
              {number}
            </button>
          </li>
        ))}
      </ul>
      <button 
        onClick={() => setModalOpenOfWhatsApp(false)}  className="whatsapp-modal-close-button" >  סגור</button>
    </div>
  </div>
  )}
</div>
  );
};

export default KitchenOrder;