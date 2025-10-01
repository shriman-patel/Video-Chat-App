import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
    
    const AuthComponent = (props) => {
        
        // useNavigate को सिर्फ एक बार, टॉप लेवल पर कॉल करें
        const navigate = useNavigate(); 
        
        // एक state variable रखें जो authentication की स्थिति को hold करे
        const [isAuth, setIsAuth] = useState(false);

        const isAuthenticated = () => {
            // हम सीधे token की presence पर निर्भर हैं
            return !!localStorage.getItem("token");
        };

        useEffect(() => {
            if (isAuthenticated()) {
                // अगर token है, तो state को true करें
                setIsAuth(true);
            } else {
                // अगर token नहीं है, तो तुरंत रीडायरेक्ट करें
                navigate("/auth", { replace: true });
            }
        }, [navigate]); // navigate को dependency array में रखना best practice है

        // 
        // 👇️ महत्वपूर्ण सुधार: कंडीशनल रेंडरिंग
        //

        // 1. अगर authentication check अभी पूरा नहीं हुआ है या विफल रहा है, तो null (या loading) रिटर्न करें।
        // इससे अनधिकृत कंपोनेंट को एक पल के लिए भी रेंडर होने से रोका जा सकता है।
        if (!isAuth) {
            return null; 
            // यदि आप लोडिंग स्क्रीन दिखाना चाहते हैं, तो यहाँ <LoadingSpinner /> रिटर्न करें
        }

        // 2. अगर authentication सफल है, तो wrappedComponent रेंडर करें
        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;