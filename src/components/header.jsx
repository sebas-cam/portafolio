
import React from "react";
import linkImg from "../image/logo.png"
import "../styles/header.css"
import { useState } from "react";
import { motion } from "framer-motion"

const variants = {
  open: { opacity: 1, width: "95%", background:"#104b89", height: "300px" },
  closed: { opacity: 1, width: "0", height: "60px" },
}

export default function Header() { 

  const [openHeader, setOpenHeader] = useState(false);

  const openHeaderMov = () =>{
    setOpenHeader(!openHeader)    
  }

  return (
    <>
      <header className="md:col-span-1 col-span-4 relative sticky top-0 z-20 main-header md:bg-[#104b89] max-h-screen grid overflow-x-hidden content-start	">
        <nav
          className="px-4 md:px-6 py-3 lg max-w-[700px] mx-auto flex flex-col py-4 justify-between gap-3 h-screen md:flex hidden"
        >    
            <div className="pb-4">
              <img className="w-4/5 m-auto imgPerfil" src={linkImg.src} alt="" />
            </div>      
            <div className="flex flex-col flex-1 p-2 space-y-4">
              <ul className="text-gray-700">
                <li className="block cursor-pointer mb-2.5 hover:bg-gray-800 hover:text-gray-300">
                  <a className="text-[#fff] block p-2" href="/">
                    Home
                  </a>
                </li>
                <li className="block cursor-pointer mb-2.5 hover:bg-gray-800 hover:text-gray-300">       
                  <a className="text-[#fff] block p-2" href="/projects">              
                    Projects 
                  </a>
                </li>
                <li className="block cursor-pointer mb-2.5 hover:bg-gray-800 hover:text-gray-300">       
                  <a className="text-[#fff] block p-2" href="/projects">              
                    Side Hustle
                  </a>
                </li>                
                <li className="block cursor-pointer mb-2.5 hover:bg-gray-800 hover:text-gray-300">
                  <a className="text-[#fff] block p-2" href="/skills">            
                    Skills
                  </a>
                </li>
                <li className="block cursor-pointer mb-2.5 hover:bg-gray-800 hover:text-gray-300">
                  <a className="text-[#fff] block p-2" href="/cv">              
                    CV
                  </a>
                </li>
                <li className="block cursor-pointer mb-2.5 hover:bg-gray-800 hover:text-gray-300">
                  <a className="text-[#fff] block p-2" href="mailto:sebasadolfo123@gmail.com">              
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="pl-4">
              <div className="flex justify-center items-center gap-x-5">
                <a href="https://www.linkedin.com/in/sebastian-campos-marcenal/" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-linkedin stroke-[#fff] hover:stroke-[#262626]" width="40" height="40" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <rect x="4" y="4" width="16" height="16" rx="2"></rect>
                      <line x1="8" y1="11" x2="8" y2="16"></line>
                      <line x1="8" y1="8" x2="8" y2="8.01"></line>
                      <line x1="12" y1="16" x2="12" y2="11"></line>
                      <path d="M16 16v-3a2 2 0 0 0 -4 0"></path>
                  </svg> 
                </a>
                <a href="https://github.com/sebas-cam" target="_blank">
                  <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-github stroke-[#fff] hover:stroke-[#262626]" width="40" height="40" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                      <path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"></path>
                  </svg>
                </a>
              </div>
            </div>
        </nav> 

        <nav className="md:hidden block ml-4 mt-4">   
          <motion.nav
            animate={openHeader ? "open" : "closed"}
            variants={variants}
          >
            <div className="btn-hamburguer" onClick={()=>openHeaderMov()}>
            {openHeader ? (
              <svg xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="#fff" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>  
            )
            : (
              <svg xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5" 
                stroke="#fff" 
                className="w-6 h-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
                />
              </svg>
            )}

            {openHeader ? (
              <ul className="pt-6">
                <li>
                  <a className="text-[#fff] block p-2" href="/">Home</a>
                </li>
                <li>
                  <a className="text-[#fff] block p-2" href="/projects">Projects</a>
                </li>
                <li>
                  <a className="text-[#fff] block p-2" href="/skills">Skills</a>
                </li>
                <li>
                  <a className="text-[#fff] block p-2" href="/cv">CV</a>
                </li>
                <li>
                  <a className="text-[#fff] block p-2" href="mailto:sebasadolfo123@gmail.com">Contact</a>
                </li>                            
              </ul>
            ):(
              <p></p>
            )
            }

            </div> 
          </motion.nav>              
        </nav>
      </header>   
    </>
  )
}

