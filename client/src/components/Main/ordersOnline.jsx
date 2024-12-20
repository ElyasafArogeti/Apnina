import React, { useEffect, useState } from 'react';
import '../../assets/stylesMain/OrdersOnline.css';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';

// import html2pdf from 'html2pdf.js';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import  Grid  from '@mui/material/Grid2';

import {  Modal, Box,Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Typography, InputAdornment, IconButton } from '@mui/material';
import NavbarHome from './NavbarHome';
const OrdersOnline = () => {
    const Navigate = useNavigate();

    const [inventoryAll, setInventoryAll] = useState({//מאגר המנות
        first_courses: [],
        main_courses: [],
        salads: [],
        side_dishes: []
    });
    const [onlineOrderMain, setOnlineOrderMain] = useState(true);//התפריט הראשי

    const [imgArraySalad, setImgArraySalad] = useState([]);//מערך התמונות

    const [loginUser, setLoginUser] = useState(null); // להירשם למערכת   
    const [sendingToManger , setSendingToManger] = useState(null);// הודעה אישור שליחה למנהל 
    const [customerOrderSummary, setCustomerOrderSummary] = useState(null); //מערך המכיל סיכום ההזמנה של הלקוח

     const [eventOwner, setEventOwner] = useState(""); //שם בעל האירוע
    const [guestCount, setGuestCount] = useState(""); //כמות האורחים
    const [eventDate, setEventDate] = useState(""); // תאריך האירוע
    const [phoneNumber, setPhoneNumber] = useState(""); //מספר האירוע
    const [shippingDate, setShippingDate] = useState(""); //תאריך שליחה
    const [email, setEmail] = useState(""); // מייל לקוח
    const [userPassword, setUserPassword] = useState(""); // מייל לקוח

    const [showPassword, setShowPassword] = useState(false);  // משתנה כדי לדעת אם להראות או להסתיר את הסיסמה

    const [selectedSalads, setSelectedSalads] = useState([]); //סלטים נבחרים
    const [selectedFirstDishes, setSelectedFirstDishes] = useState([]); //מנות ראשונות נבחרות
    const [selectedMainDishes, setSelectedMainDishes] = useState([]); //נבחרו מנות עיקריות
    const [selectedSides, setSelectedSides] = useState([]); //צדדים נבחרים 
    

    const [orderSummary, setOrderSummary] = useState(null); //מערך המכיל סיכום ההזמנה
    const [totalPrice, setTotalPrice] = useState(0); //מחיר כולל

    const [firstDishQuantities, setFirstDishQuantities] = useState({}); // כמות מנות ראשונות לכל מנה ראשונה
    const [mainDishQuantities, setMainDishQuantities] = useState({}); // כמות מנות עיקריות לכל מנה עיקרית

    
    const [errorFirstDish, setErrorFirstDish] = useState(null); // הודעת שגיאה כמות מנות לא תואמות למוזמנים
    const [errorMainDish, setErrorMainDish] = useState(null); // הודעת שגיאה כמות מנות לא תואמות למוזמנים
  
    const [isQuantityModalOpen, setIsQuantityModalOpen] = useState(false); // מצב חלון הכמויות
    const [errorMessage , setErrorMessage] = useState(null); // הודעת שגיאה כללית 
    const [isModalOpen, setIsModalOpen] = useState(false);


    const [openImageDialog, setOpenImageDialog] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
  //--------------------------------------------------------------------------
    useEffect(() => {
        const fetchInventoryAll = async () => {
            try {
                const response = await fetch('http://localhost:3001/inventoryAll');
                const data = await response.json();
                setInventoryAll(data);
            } catch (error) {
                console.error('Failed to fetch inventory:', error);
            }
        };
        fetchInventoryAll();
        setImgArraySalad(["https://magashim.co.il/wp-content/uploads/2024/07/4-1.webp","https://images.kikar.co.il/cdn-cgi/image/format=jpeg,fit=contain,width=1200/2021/03/31/ebd5d7e0-01c5-11ef-8590-ed85b6ab3b94__h667_w1000.jpg","https://www.gorme.co.il/wp-content/uploads/2023/10/%D7%A2%D7%99%D7%A6%D7%95%D7%91-%D7%9C%D7%9C%D7%90-%D7%A9%D7%9D-55.jpg"]);
    }, []);
  //--------------------------------------------------------------------------
    useEffect(() => {
      if (customerOrderSummary && orderSummary) {
        setIsModalOpen(true); // פותחים את המודל כאשר יש מידע להזמנה
        console.log(isModalOpen);
      }
    }, [customerOrderSummary, orderSummary]);
  //--------------------------------------------------------------------------
    // חישוב המנה 
    const handleSubmit = async () => {
  
      const totalFirstDish = Object.values(firstDishQuantities).map(quantity => Number(quantity)).reduce((total, quantity) => total + quantity, 0);
      const totalMainDish  = Object.values(mainDishQuantities).map(quantity => Number(quantity)).reduce((total, quantity) => total + quantity, 0);
    setErrorFirstDish(totalFirstDish);
    setErrorMainDish(totalMainDish);
      if (totalFirstDish > guestCount || totalFirstDish < guestCount || totalMainDish > guestCount || totalMainDish < guestCount ) {
        setErrorMessage(" הכמויות שהזנת לא תואמות את כמות המוזמנים . אנא חשב שוב את הכמויות");  
        setTimeout(() => {
           setErrorMessage(null);
        },7000);
       
      } else {
          setErrorMessage(null); // אם אין שגיאה, ננקה את ההודעה

          let total = 0;
          // חישוב סיכום הזמנה
          const selectedSaladsData = selectedSalads.map((id) => {
              const salad = inventoryAll.salads[id - 1];
              const totalPrice = salad.weight * salad.price / 1000 * guestCount ;
              total += totalPrice;
              return {
                  dish_name: salad.dish_name,
                  totalPrice: totalPrice.toFixed(2),
                  totalWeight: (salad.weight * guestCount).toFixed(2)
              };
          });
  
          const selectedFirstDishesData = selectedFirstDishes.map((id) => {
              const firstDish = inventoryAll.first_courses.find(d => d.id === id);
              let totalPrice = 0 ;
              let totalWeight = 0;
              if(firstDish.weight > 0 && firstDish.weight < 2) { // יחידות
                  totalPrice = firstDishQuantities[id] * firstDish.price;
                  totalWeight = firstDishQuantities[id];
              } else {
                  totalPrice = (firstDishQuantities[id] * firstDish.weight) / 1000 * firstDish.price;
                  totalWeight = firstDishQuantities[id];
              }
              total += totalPrice;
              return {
                  dish_name: firstDish.dish_name,
                  totalPrice: totalPrice.toFixed(2),
                  totalWeight: totalWeight
              };
          });
  
          const selectedMainDishesData = selectedMainDishes.map((id) => {
              const mainDish = inventoryAll.main_courses.find(d => d.id === id);
              let totalPrice = 0 ;
              let totalWeight = 0;
              if(mainDish.weight > 0 && mainDish.weight < 2) { // יחידות
                  totalPrice = mainDishQuantities[id] * mainDish.price;
                  totalWeight = mainDishQuantities[id];
              } else {
                  totalPrice = (mainDishQuantities[id] * mainDish.weight) / 1000 * mainDish.price;
                  totalWeight = mainDishQuantities[id];
              }
              total += totalPrice;
              return {
                  dish_name: mainDish.dish_name,
                  totalPrice: totalPrice.toFixed(2),
                  totalWeight: totalWeight
              };
          });
  
          const selectedSidesData = selectedSides.map((id) => {
              const side = inventoryAll.side_dishes[id - 1];
              const totalPrice = (side.weight * side.price) / 1000 * guestCount;
              total += totalPrice;
              return {
                  dish_name: side.dish_name,
                  totalPrice: totalPrice.toFixed(2),
                  totalWeight: (side.weight * guestCount).toFixed(2)
              };
          });
  
          const selectedItems = {
              salads: selectedSaladsData,
              first_courses: selectedFirstDishesData,
              main_courses: selectedMainDishesData,
              side_dishes: selectedSidesData
          };
  
          setOrderSummary(selectedItems);
          setTotalPrice(total.toFixed(2));
          setCustomerOrderSummary(selectedItems);  
          setIsQuantityModalOpen(false);
          setOnlineOrderMain(false);

      };
    }
    //--------------------------------------------------------------------------
   const addOrdersOnline = async () => {
     try {
              const response = await fetch('http://localhost:3001/addOrdersOnline', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                      userName: eventOwner,
                      userPhone: phoneNumber,
                      guestCount: guestCount,
                      eventDate: eventDate,
                      orderMenu: customerOrderSummary,
                      totalPrice: totalPrice,
                      shippingDate: shippingDate,
                      email: email,
                      Password : userPassword
                  }),
              });
              const data = await response.json();
              if (data.message === 'נשלח בהצלחה') {
                  setSendingToManger("true");
              }
          } catch (error) {
              console.error('שגיאה בשמירת ההזמנה:', error);
              alert("אירעה שגיאה בשמירת ההזמנה.");
          }
      } 
//--------------------------------------------------------------------------    
      const [errors, setErrors] = useState({
        phoneNumber: '',
        guestCount: '',
        email:'',
        Password: ''
    });
  //--------------------------------------------------------------------------
  const openQuantityModal = () => { // כמות המנות שבוחר הלקוח
    let hasError = false; // בדיקת הלקוח בהכנסת פרטים
    const newErrors = {
        phoneNumber: '',
        guestCount: '',
        email: '',
       Password: ''
    };
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {  // בדיקת מספר פלאפון (10 ספרות)
        newErrors.phoneNumber = "מספר הפלאפון חייב להיות בן 10 ספרות.";
        hasError = true;
    }
    if (guestCount <= 0 || guestCount > 1000) { // בדיקת כמות מוזמנים (לא יותר מ-1000)
        newErrors.guestCount = "כמות המוזמנים לא יכולה להיות פחותה מ-1 או יותר מ-1000.";
        hasError = true;
    }
       // בדיקה עבור המייל
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email && !emailRegex.test(email)) {  
        newErrors.email = "כתובת מייל אינה חוקית.";
        hasError = true;
    }
    setErrors(newErrors);
    setShippingDate(new Date().toISOString().slice(0, 19).replace('T', ' '));
    if (!hasError) {
      setIsQuantityModalOpen(true);
      setLoginUser(null);
    }
  };
  //--------------------------------------------------------------------------
//חלון הרשמה 
    const openEditModal = () => {  
      setLoginUser("true"); 
  };
    //--------------------------------------------------------------------------
  //סגירת חלון הרשמה 
  const closeEditModal = () => {
    setLoginUser(null);
  };
    //--------------------------------------------------------------------------
  // שינוי כמות הלקוח
  const handleQuantityChange = (category, id, quantity) => {
    switch (category) { 
      case 'first_courses':
        // עדכון כמות המנות הראשונות
        setFirstDishQuantities(prev => ({ ...prev, [id]: quantity }));
        break;
      case 'main_courses':
        // עדכון כמות המנות העיקריות
        setMainDishQuantities(prev => ({ ...prev, [id]: quantity }));
        break;
      default:
        break;
    }
  };
  //--------------------------------------------------------------------------
//   // קבלה ללקוח 
//   const handleDownloadReceipt = () => {
//     const receiptContent = `
//         <div style="text-align: center; font-family: 'Helvetica', sans-serif; direction: rtl; padding: 20px; font-size: 16px;">

//             <h1>הזמנה נשלחה בהצלחה</h1>
//             <h1> אולמי הפנינה</h1>
//             <h2>תאריך האירוע: ${eventDate}</h2>
//             <h2>שם בעל האירוע: ${eventOwner}</h2>
//             <h2>מספר מוזמנים: ${guestCount}</h2>
//         </div>
//     `;
//     const element = document.createElement('div');
//     element.innerHTML = receiptContent;
//     document.body.appendChild(element);
//     const options = {
//         margin:       10,
//         filename:     `קבלה_${eventOwner}_${eventDate}.pdf`,
//         image:        { type: 'jpeg', quality: 0.98 },
//         html2canvas:  { scale: 2 },
//         jsPDF: {
//             unit: 'mm',
//             format: [80, 130],
//             orientation: 'portrait'
//         }
//     };
//     html2pdf().from(element).set(options).save();
//     document.body.removeChild(element);
// };
//--------------------------------------------------
const handleImageClick = (imageSrc) => {
  setSelectedImage(imageSrc);
  setOpenImageDialog(true);
};
//-------------------------------------------------
const closeDialog = () => {
  setOpenImageDialog(false);
  setSelectedImage(null);
};
//----------------------------------------------
useEffect(() => { // אם המידע קיים, נגלול את הדף לראש
  if (customerOrderSummary && orderSummary) {
    window.scrollTo(0, 0); // גלילה לראש העמוד
  }
}, [customerOrderSummary, orderSummary]); // פונקציה זו תתבצע בכל פעם שהמידע משתנה
//----------------------------------------------------
const handleClickShowPassword = () => { // מתחלף בין הצגת הסיסמה להסתרת הסיסמה
  setShowPassword((prev) => !prev); 
};

return (
  <div>
    <NavbarHome/>
 {onlineOrderMain && (
    <div className="online-order-container">
      <div className="order-header">
        <h2 className="order-header-title">בחירת תפריט </h2>
      </div>
      <div dir="rtl" className="menu-container">
        <div className="menu-header">
          <h1 className="menu-title">תפריט אירועים</h1>
          <h2 className="menu-subtitle">קייטרינג הפנינה - כשר למהדרין</h2>
          <p className="menu-contact">פלאפון - 054-6600-200 | מייל - eli6600200@gmail.com</p>
        </div>

        <table className="menu-table-order-online" dir="rtl">
          <tbody>
            {/* סלטים */}
            <tr>
              <td className="menu-section-from">
                <h2 className="menu-section-title">סלטים [8 לבחירה]</h2>
                <ul className="menu-list">
                  { inventoryAll.salads.filter(side => side.is_hidden).map((salad) => (
                    <div key={salad.id} className="menu-item-img">
                      <img
                        src={imgArraySalad[salad.id - 1]}
                        alt="תמונה להמחשב בלבד"
                        className="menu-item-thumbnail"
                        onClick={() => handleImageClick(imgArraySalad[salad.id - 1])} // לחיצה על התמונה
                      />
                      <label className="menu-item-label">
                        <span className="menu-item-name">{salad.dish_name}</span>
                      </label>
                      <input
                        type="checkbox"
                        value={salad.id}
                        className="menu-checkbox"
                        onChange={(e) => {
                          const id = salad.id;
                          setSelectedSalads((prev) => {
                            if (e.target.checked) {
                              return [...prev, id];
                            } else {
                              return prev.filter((s) => s !== id);
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                </ul>
              </td>
            </tr>

            {/* מנה ראשונה */}
            <tr>
              <td className="menu-section-from">
                <h2 className="menu-section-title">מנה ראשונה [3 לבחירה]</h2>
                <ul className="menu-list">
                  { inventoryAll.first_courses.filter(side => side.is_hidden).map((firstDish) => (
                    <li key={firstDish.id} className="menu-item">
                      <label className="menu-item-label">
                        <input
                          type="checkbox"
                          value={firstDish.id}
                          className="menu-checkbox"
                          onChange={(e) => {
                            const id = firstDish.id;
                            setSelectedFirstDishes((prev) => {
                              if (e.target.checked) {
                                return [...prev, id];
                              } else {
                                return prev.filter((f) => f !== id);
                              }
                            });
                          }}
                        />
                        <span className="menu-item-name">{firstDish.dish_name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>

            {/* מנה עיקרית */}
            <tr>
              <td className="menu-section-from">
                <h2 className="menu-section-title">מנה עיקרית [3 לבחירה]</h2>
                <ul className="menu-list">
                  { inventoryAll.main_courses.filter(side => side.is_hidden).map((mainDish) => (
                    <li key={mainDish.id} className="menu-item">
                      <label className="menu-item-label">
                        <input
                          type="checkbox"
                          value={mainDish.id}
                          className="menu-checkbox"
                          onChange={(e) => {
                            const id = mainDish.id;
                            setSelectedMainDishes((prev) => {
                              if (e.target.checked) {
                                return [...prev, id];
                              } else {
                                return prev.filter((m) => m !== id);
                              }
                            });
                          }}
                        />
                        <span className="menu-item-name">{mainDish.dish_name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>

            {/* תוספות */}
            <tr>
              <td className="menu-section-from">
                <h2 className="menu-section-title">תוספות [3 לבחירה]</h2>
                <ul className="menu-list">
                  {inventoryAll.side_dishes.filter(side => side.is_hidden).map((side) => (
                    <li key={side.id} className="menu-item">
                      <label className="menu-item-label">
                        <input
                          type="checkbox"
                          value={side.id}
                          className="menu-checkbox"
                          onChange={(e) => {
                            const id = side.id;
                            setSelectedSides((prev) => {
                              if (e.target.checked) {
                                return [...prev, id];
                              } else {
                                return prev.filter((s) => s !== id);
                              }
                            });
                          }}
                        />
                        <span className="menu-item-name">{side.dish_name}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="order-summary-container">
          <br />
          <button onClick={openEditModal} className="order-summary-button">
            סיכום הזמנה
          </button>
          <br />
          <br />
        </div>
      </div>
   
      <Dialog open={openImageDialog} onClose={closeDialog} maxWidth="md" fullWidth>
      <DialogTitle>תמונה מוגדלת</DialogTitle>
      <DialogContent>
        {/* התמונה שתופס את כל הרוחב */}
        <img src={selectedImage} alt="מנה גדולה" className="image-dialog-img" />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} color="primary">
          סגור
        </Button>
      </DialogActions>
    </Dialog>


  </div>
     )}
      
    
    {/* -------------------חלון השארת פרטים--------------------------------------------------------- */}
    {loginUser && (
      <Modal open={true} onClose={closeEditModal}>
        <Box dir="rtl"  component="form"  sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', 
          bgcolor: 'background.paper', borderRadius: 2, padding: 3, width: '80%', maxWidth: 500, boxShadow: 24,
        }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            השאר פרטים כדי שנמשיך
          </Typography>

          <Grid container spacing={3} padding={2}>
            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                label="תאריך האירוע שלכם"
                type="date"
                fullWidth
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                error={Boolean(errors.eventDate)}
                helperText={errors.eventDate}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                label="שם מלא"
                type="text"
                fullWidth
                value={eventOwner}
                onChange={(e) => setEventOwner(e.target.value)}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                label="מספר פלאפון"
                type="tel"
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                error={Boolean(errors.phoneNumber)}
                helperText={errors.phoneNumber}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                label="כתובת מייל"
                type="email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={Boolean(errors.email)}
                helperText={errors.email}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
                label=" סיסמא לאזור אישי                   " 
                type={showPassword ? 'text' : 'password'}   fullWidth
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                error={Boolean(errors.Password)}  // הצגת שגיאה אם קיימת
                helperText={errors.Password}
                required
                InputProps={{
                    endAdornment: (
                        <InputAdornment position=" end">
                            <IconButton
                                onClick={handleClickShowPassword} >
                                {showPassword ? <VisibilityOff /> : <Visibility />}  {/* אם הסיסמה מוצגת, מציגים אייקון של עין סגורה, אחרת עין פתוחה */}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
             />
             </Grid>

            <Grid size={{ xs: 12, sm: 6 }} >
              <TextField
                label="כמות המוזמנים"
                type="number"
                fullWidth
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                error={Boolean(errors.guestCount)}
                helperText={errors.guestCount}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm:12 }} display="flex" justifyContent="center">
              <Button variant="contained" onClick={openQuantityModal} color="primary">
                המשך בהזמנה
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    )};

  {/* ---------------- חלון כמות מנות -------------------------------------------------------------------- */}
  <Dialog textAlign="center" open={isQuantityModalOpen}>
      <DialogTitle>
        <Typography variant="h6" style={{fontFamily:"-moz-initial"}}>! עזור לנו לדעת מה רצונך</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" style={{fontFamily:"-moz-initial"}}>הגדר את כמות המנות במדויק עבור כל סוג מנה שבחרת</Typography>
        <Typography variant="body1" style={{fontFamily:"-moz-initial"}}>פרוס את בחירתך עבור : <strong>{guestCount}</strong> איש לכל קטגוריה</Typography>

        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6" style={{fontWeight: 'bold'}}>מנות ראשונות</Typography>
          {selectedFirstDishes.map((id) => {
            const dish = inventoryAll.first_courses.find(d => d.id === id);
            return (
              <Grid container spacing={1} key={id} alignItems="center">
                <Grid  size={{ xs: 12, sm: 6 }}>
                  <Typography style={{fontFamily:"-moz-initial"}}> {dish.dish_name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} marginTop={1} >
                  <TextField
                    fullWidth
                    type="number"
                    min="0"
                    value={firstDishQuantities[id]}
                    onChange={(e) => handleQuantityChange('first_courses', id, e.target.value)}
                    required
                    variant="outlined"
                    size="small"
                  />
                </Grid>        
              </Grid>
            );
          })}
          {errorFirstDish && (errorFirstDish > guestCount || errorFirstDish < guestCount) && (
            <Typography color="error" variant="body2">הזנת: <strong>{errorFirstDish}</strong> אך יש לך {guestCount} מוזמנים</Typography>
          )}
        </div>
        <div style={{ marginTop: '20px' }}>
          <Typography variant="h6" style={{fontWeight: 'bold'}}>מנות עיקריות</Typography>
          {selectedMainDishes.map((id) => {
            const dish = inventoryAll.main_courses.find(d => d.id === id);
            return (
              <Grid container spacing={1} key={id} alignItems="center">  
              <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography style={{fontFamily:"-moz-initial"}}>{dish.dish_name}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }} marginTop={1}>
                  <TextField
                    fullWidth
                    type="number"
                    min="0"
                    value={mainDishQuantities[id]}
                    onChange={(e) => handleQuantityChange('main_courses', id, e.target.value)}
                    required
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              
              </Grid>
            );
          })}
          {errorMainDish && (errorMainDish > guestCount || errorMainDish < guestCount) && (
            <Typography color="error" variant="body2">הזנת: <strong>{errorMainDish}</strong> אך יש לך {guestCount} מוזמנים</Typography>
          )}
        </div>
        {errorMessage && (
          <Typography color="error" variant="body2" style={{ marginTop: '5px' }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions >
        <Button onClick={handleSubmit} color="primary" variant="contained">
          המשך להצעת מחיר
        </Button>
      </DialogActions>
    </Dialog>
    

{/* //-----------------------------סיכום הצעת מחיר------------------------------------------------ */}
 {customerOrderSummary && orderSummary && (
  <div className="kitchen-order-container"> <br />
  <div className='kitchen-order-header'>
    <h1>{eventOwner} תודה שבחרת בקיינטרינג הפנינה</h1>
    <h1>הצעת המחיר שלנו להזמנה שלך סה"כ : <strong style={{color:"red"}}>{totalPrice}</strong></h1><br /> 
    <p>... המחיר אינו כולל אולם / מלצרים / אנשי מטבח ועוד</p><br />
    <h2>פרטי ההזמנה שלך </h2><br />
    </div>
    {Object.keys(orderSummary).map((category) => ( 
      <div key={category} className="kitchen-order-category">   
        <h4 className="kitchen-order-category-title">
          {category === 'salads' ? 'סלטים' :
           category === 'first_courses' ? 'מנות ראשונות' :
           category === 'main_courses' ? 'מנות עיקריות' : 'תוספות'}
        </h4>
        <table className="kitchen-order-table" dir='rtl'>
          <thead>
            <tr>
              <th>שם המנה</th>
             
            </tr>
          </thead>
          <tbody>
            {orderSummary[category].map((item, index) => (
              <tr key={`${item.dish_name}-${index}`}>
                <td>{item.dish_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>   
    ))}
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
     <h4>אני מאשר על אשר עברתי על פרטי ההזמנה בהצלחה וברצוני שתחזרו אלינו בהקדם </h4>
     <input type='checkbox' className="menu-checkbox"></input>
     </div><br />
    <button className="order-summary-button" onClick={addOrdersOnline}>שליחת ההזמנה</button>
    <br /><br />
  </div>
)}




    {/* -------------------הודעת ברכות להרשמה----------------------------------------------------- */}
    {sendingToManger && (
      <div className='modal-online-success'>
    <div className="modal-content-user-order-online-success">
      <button  className="close-button-user-order-online-success" onClick={() => { Navigate('/')}} >סגור</button>       
        <Confetti width={window.innerWidth} height={window.innerHeight} />
        <div>
          <br />
          <h1>ברכת מזל טוב   - {eventOwner}</h1>
        <h1 className="success-message">הזמנתך נשלחה  בהצלחה </h1>
        <h3> ניצור איתך קשר בהקדם להמשך התהליך</h3>
        <h3>לאחר אישור ההזמנה תקבלו תגובה במייל ותוכלו לראות את ההזמנות שלכם </h3>
        <h3> שלום ותודה קיינטרינג הפנינה </h3>
        <br />
      </div>
   </div>
  </div>
  )}
   </div>
   
 )}


export default OrdersOnline;

