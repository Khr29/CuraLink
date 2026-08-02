// import { createContext } from "react";

// export const AppContext = createContext()

// const AppContextProvider = (props) => {

//     const currency = '$'

//     const calculateAge = (dob)=>{
//         const today = new Date()
//         const birtDate = new Date(dob)
//         let age = today.getFullYear() - birtDate.getFullYear()
//         return age
//     }

//     const months = [ " ","Jan","Feb","Mar","Apr","May","Jun","jul","Aug","Sep","Oct","Nov","Dec"]
    
//       const slotDateFormat = (slotDate) => {
//         const dateArray = slotDate.split('_')
//         return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
//       }
//     const value = {
//         calculateAge,
//         slotDateFormat,
//         currency
//     }
//     return(
//         <AppContext.Provider value={value}>
//             {props.children}
//         </AppContext.Provider>
//     )
// }
// export default AppContextProvider

import { createContext, useMemo } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const currency = '$';

    // ✅ calculateAge optimized
    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);

        let age = today.getFullYear() - birthDate.getFullYear();

        // 🔥 more accurate (month/day check)
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    };

    // ✅ months constant (fixed typo + no re-create)
    const months = useMemo(() => (
        ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    ), []);

    // ✅ slotDateFormat optimized
    const slotDateFormat = (slotDate) => {
        const [day, month, year] = slotDate.split('_');
        return `${day} ${months[Number(month)]} ${year}`;
    };

    // ✅ memoized value (prevents unnecessary re-renders)
    const value = useMemo(() => ({
        calculateAge,
        slotDateFormat,
        currency
    }), [months]);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;