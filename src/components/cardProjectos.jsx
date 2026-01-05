import React from "react"
import imgCss from "../image/css.png"
import imgExpress from "../image/express.png"
import imgHtml from "../image/html.png"
import imgJavascript from "../image/javascript.png"
import imgJwt from "../image/jwt.png"
import imgMongodb from "../image/mongodb.png"
import imgReact from "../image/react.png"
import imgRedux from "../image/redux.png"
import imgTailwind from "../image/tailwind.png"
import imgMysql from "../image/mysql.png"
import imgNodejs from "../image/nodejs.png"
import imgPython from "../image/python.png"
import imgViteJs from "../image/vitejs.png"

export default function ProjectCard({ maxProjects = 6 }) {    
    
    const projectsArray = [
        {
            'id': 1,
            'imagen':'https://res.cloudinary.com/dhanciveg/image/upload/v1687876812/Joke%20maker/jodeMaker_lovpxi.png',
            'titulo':'Joke Generator',
            'descripcion':'The joke generator web app is a fun tool that allows you to get jokes from different categories in the language of your choice. With just a few clicks, you can brighten your day with jokes in English or Spanish. You can choose from various categories such as programming, miscellaneous, dark, puns, spooky, and Christmas. Additionally, you have the option to select the language in which you want to receive the jokes.',
            'linkGit':'https://github.com/sebas-cam/joke-maker',
            'linkWeb':'http://joke-generator.sebastian-campos.com/',
            'alt':"joke maker, generate a joke, joke generator",
            'title':"Joke Generator",
            'svg': [imgHtml, imgCss, imgTailwind, imgJavascript, imgReact, imgViteJs]            
        },
        {
            'id': 2,
            'imagen':'https://res.cloudinary.com/dhanciveg/image/upload/v1687463430/tiktaktoe/tiktaktou_wbvwrn.png',
            'titulo':'Tic Tac Toe',
            'descripcion':'The Tic Tac Toe app is a classic game implementation where users can enjoy playing against either another player or the computer. The app features a visually appealing and user-friendly interface that displays the game board and allows players to make their moves. It keeps track of the players moves and determines the outcome of the game, whether its a victory, a draw, or any other result.',
            'linkGit':'https://github.com/sebas-cam/Tic-Tac-Toe',
            'linkWeb':'http://tic-tac-toe.sebastian-campos.com/',
            'alt':"tic tac toe app, sebastian campos, tic tac toe",
            'title':"Tic Tac Toe ",
            'svg': [imgHtml, imgCss, imgJavascript, imgReact, imgViteJs]
        },
        {
            'id': 3,
            'imagen':'https://res.cloudinary.com/dhanciveg/image/upload/v1687219500/Gesto%20de%20notas/addNote_nebj9z.png',
            'titulo':'Gestor de notas',
            'descripcion':'My project is a note-taking application that allows users to create, read, edit, and delete notes. It provides a user-friendly interface to manage personal or professional notes efficiently. The application allows users to create new notes by entering a title and the content of the note.',
            'linkGit':'https://github.com/sebas-cam/notas-app-complete',
            'linkWeb':'https://app-notas-projecto.sebastian-campos.com/',
            'alt':"Gestor de notas, add notes, create notes",
            'title':"Gestor de notas",
            'svg': [ imgHtml, imgCss, imgTailwind, imgJavascript, imgReact, imgRedux, imgJwt, imgPython, imgMysql]
        },        
        {
            'id': 4,
            'imagen':'https://res.cloudinary.com/dhanciveg/image/upload/v1687218987/rickandmorty_zzplyv.png',
            'titulo':'Rick y Morty App',
            'descripcion':'My project uses the Rick and Morty API to provide fans of the series with an interactive and fun experience. The application displays detailed information about the characters, episodes, and locations from the animated series. Users can explore the extensive list of characters and retrieve data such as their name, species, status, gender, and origin.',
            'linkGit':'https://github.com/sebas-cam/Rick-and-Morty',
            'linkWeb':'https://rick-and-morty.sebastian-campos.com/',
            'alt':"Rick and morty, rick and morty web, rick and morty app",
            'title':"Rick y Morty App",
            'svg': [imgHtml, imgCss, imgTailwind, imgJavascript, imgReact, imgViteJs]
        },
        {
            'id': 5,
            'imagen':'https://astro-modern-personal-website.netlify.app/_astro/post_img_Z1NWKef.webp',
            'titulo':'Palabras clase para el ceo por inteligencia artificial',
            'descripcion':'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil neque molestias tenetur veritatis officiis in eius consequatur aliquam ipsam dicta iste ipsum illo possimus sapiente quidem laboriosam, dolorem est iusto.',
            'linkGit':'#',
            'linkWeb':'#',
            'alt':"escribir datos sobre el projecto para ceo",
            'title':"titulo para mejorar la experiencia de usuario, cuando el mouse esta sobre la imagen",
            'svg': [imgCss, imgExpress, imgHtml, imgJavascript, imgJwt, imgMongodb, imgReact, imgRedux, imgTailwind, imgMysql, imgNodejs, imgPython]
        },
        {
            'id': 6,
            'imagen':'https://astro-modern-personal-website.netlify.app/_astro/post_img_Z1NWKef.webp',
            'titulo':'Plataforma de reservas',
            'descripcion':'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Nihil neque molestias tenetur veritatis officiis in eius consequatur aliquam ipsam dicta iste ipsum illo possimus sapiente quidem laboriosam, dolorem est iusto.',
            'linkGit':'#',
            'linkWeb':'#',
            'alt':"escribir datos sobre el projecto para ceo",
            'title':"titulo para mejorar la experiencia de usuario, cuando el mouse esta sobre la imagen",
            'svg': [imgCss, imgExpress, imgHtml, imgJavascript, imgJwt, imgMongodb, imgReact, imgRedux, imgTailwind, imgMysql, imgNodejs, imgPython]            
        }        
    ]

    const projectsList = projectsArray.slice(0, maxProjects).map(project =>       
        <div key={project.id} className="grid grid-cols-4 gap-4 text-[#fff] hover:scale-105 hover:shadow-lg ease-in duration-300 rounded-2xl px-2 py-8">
            <div class="col-span-4 md:col-span-1 m-auto">
                <img className="rounded-2xl" src={project.imagen}></img>
            </div>
            <div class="col-span-4 md:col-span-3">
                <h1 className="text-2xl">{project.titulo} -    
                <span className="block md:contents">                     
                    {project.svg.map(img =>(
                        <img className="inline w-6 mr-2" src={img}></img>   
                    ))}                       
                </span> 
                </h1>
                <p className="text-base pt-2">{project.descripcion}</p>
                <p className="flex pt-2">
                    <a href={project.linkWeb} target="_blank" className="mr-4">
                        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12s4.477 10 10 10M13 2.05S16 6 16 12" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11 21.95S8 18 8 12c0-6 3-9.95 3-9.95M2.63 15.5H12M2.63 8.5h18.74" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path clip-rule="evenodd" d="M21.879 17.917c.494.304.463 1.043-.045 1.101l-2.567.291-1.151 2.312c-.228.459-.933.234-1.05-.334l-1.255-6.116c-.099-.48.333-.782.75-.525l5.318 3.271z" stroke="#ffffff" stroke-width="1.5"></path></svg>
                    </a>
                    <a href={project.linkGit} target="_blank">
                        <svg width="24px" height="24px" stroke-width="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#ffffff"><path d="M16 22.027v-2.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7a5.44 5.44 0 00-1.5-3.75 5.07 5.07 0 00-.09-3.77s-1.18-.35-3.91 1.48a13.38 13.38 0 00-7 0c-2.73-1.83-3.91-1.48-3.91-1.48A5.07 5.07 0 005 5.797a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.58v2.87M9 20.027c-3 .973-5.5 0-7-3" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                    </a>
                </p>
            </div>
        </div>
    );

    return (
        <>
            <div className="py-4">{projectsList}</div>
        </>      
    )
}