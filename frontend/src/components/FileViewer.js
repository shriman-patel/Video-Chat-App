import React from 'react';

export default function FileViewer({ fileUrl, fileType, isLocalSharing, stopSharing }) {
    if (!fileUrl) return null;

    let content;

    // 1. content तय करें (image, pdf, या ppt)
    if (fileType === 'image') {
        content = <img src={fileUrl} alt="Shared Content" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />;
    } else if (fileType === 'pdf' || fileType === 'ppt') {
        // PPT/PDF के लिए iframe/embed का उपयोग करें
        content = (
            <iframe
                src={fileUrl}
                title="Shared Document"
                style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'white' }}
                allowFullScreen
            ></iframe>
        );
    } else {
        content = <p style={{ color: 'white' }}>फ़ाइल प्रकार समर्थित नहीं है।</p>;
    }

    // 2. ओवरले स्टाइल (Independent Display)
    return (
             <div style={{
            // 1. ✅ यह सबसे महत्वपूर्ण है: बटन को ठीक से स्थित करने के लिए
            position: 'relative', 
            
            width: '100%',
            height: '90vh', 
            
            backgroundColor: '#1a1a1a', 
            padding: '20px', // padding को 100px से 20px करें ताकि बटन के लिए जगह हो
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            
            {/* Stop Sharing Button (केवल लोकल शेयरर को दिखेगा) */}
            {isLocalSharing && (
                 <button 
        onClick={stopSharing} 
        style={{
            position: 'absolute',
            top: '5px',        // बटन को थोड़ा ऊपर शिफ्ट किया
            right: '5px',      // बटन को थोड़ा किनारे शिफ्ट किया
            
            // ✅ केवल आइकन के लिए साइज़ को छोटा करें
            width: '30px',     
            height: '30px',    
            padding: '0',      // पैडिंग हटा दें
            
            backgroundColor: '#dc3545', // Red
            color: 'white',
            border: 'none',
            borderRadius: '50%', // ✅ गोल बटन
            cursor: 'pointer',
            fontSize: '20px',  // ✅ आइकन साइज़
            lineHeight: '1',   // सुनिश्चित करें कि 'X' केंद्र में है
            display: 'flex',   // 'X' को केंद्र में लाने के लिए flex
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        {/* ✅ टेक्स्ट के बजाय 'X' (Unicode Times Sign) का उपयोग करें */}
        &times; 
    </button>
)}
            
            {/* Content Area */}
            <div style={{ width: '90%', height: '90%', maxWidth: '1200px', maxHeight: '800px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {content}
            </div>
        </div>
    );
}