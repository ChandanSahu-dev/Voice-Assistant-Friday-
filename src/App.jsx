import React, { useEffect, useState } from 'react'
import img from './friday.png'


const App = () => {

  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [information, setInformation] = useState("");
  const [voices, setVoice] = useState([]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  const loadVoice = () => {
    const allVoice = window.speechSynthesis.getVoices(); //voice commands given by the user stored in allVoice.
    setVoice(allVoice);// giving the allVoice commands to setVoice() in useState.
  }

  //we want to run all the voice commands given by the user while the browser reloads itself.
  useEffect(() => {
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoice;// if the user doesn't say anything then it will return null.
    }
    else {
      loadVoice(); //or else the information will be stored in an array by calling the loadVoice().
    }
  }, []);

  //function for listening:
  const startListening = () => {
    recognition.start();
    setIsListening(true);
  } // this function is called at the time of clicking the button.

  //Speech to transcript:
  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript.toLowerCase();
    setTranscript(spokenText);
    handleVoiceCommand(spokenText);
  }

  //turnning off the listening mode after the user has given the command:
  recognition.onend = () => setIsListening(false);

  //function for speaking voice:
  const speakText = (text) => {
    if (voices.length === 0) {
      console.warn("No voice available yet.")
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    const maleEnglishVoice = voices.find((voice) =>
      voice.lang.startsWith("en-") && voice.name.toLowerCase().includes("male")) || voices.find((voice) => voice.lang.startsWith("en-")) || voices[0]

    utterance.voice = maleEnglishVoice;
    utterance.lang = maleEnglishVoice.lang || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1
    utterance.volume = 1;

    window.speechSynthesis.speak(utterance)

  }
  // handle the voice commands : to open google/wikipedia etc.
  const handleVoiceCommand = async (command) => {
    if (command.startsWith("open ")) {
      const site = command.split("open ")[1].trim();

      const sitesMap = {
        youtube: "https://www.youtube.com",
        facebook: "https://www.facebook.com",
        google: "https://www.google.com",
        twitter: "https://www.twitter.com",
        instagram: "https://www.instagram.com",
      };

      if (sitesMap[site]) {
        speakText(`Opening ${site}`);
        window.open(sitesMap[site], "_blank");
        setInformation(`Opened ${site}`);
      } else {
        speakText(`I don't know how to open ${site}`);
        setInformation(`Could not find the website for  ${site}`);
      }
      return;
    }

    if (command.includes("what is your name")) {
      const response = "Hello Sir, I'm Friday, your voice assistant powered by React, created by Mr. Chandan Sahu. how can i help you...?";
      speakText(response);
      setInformation(response);
      return;
    } else if (command.includes("hello friday")) {
      const response = "Hello Sir, How can i help you...?";
      speakText(response);
      setInformation(response);
      return;
    } else if (command.includes("what is your age")) {
      const response = "Hello Sir I'm Friday, I'm 2 day old";
      speakText(response);
      setInformation(response);
      return;
    }

    // List of famous people
    const famousPeople = [
      "bill gates",
      "mark zuckerberg",
      "elon musk",
      "steve jobs",
      "warren buffet",
      "barack obama",
      "jeff bezos",
      "sundar pichai",
      "mukesh ambani",
      "virat kohli",
      "sachin tendulkar",
      "brian lara",
      "Shahrukh Khan",
    ];

    if (famousPeople.some((person) => command.includes(person))) {
      const person = famousPeople.find((person) => command.includes(person))
      const personData = await fetchPersonData(person)

      if (personData) {
        const infoText = `${personData.name}, ${personData.extract}`
        setInformation(infoText)
        speakText(infoText)

        performGoogleSearch(command)
      } else {
        const fallbackMessage = "I couldn't find detailed information"

        speakText(fallbackMessage)
        performGoogleSearch(command)
      }

    } else {
      const fallbackMessage = `Here is the information about ${command}`;

      speakText(fallbackMessage);
      performGoogleSearch(command);
    }

  }

  const fetchPersonData = async (person) => {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      person
    )}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if(data && data.title && data.extract){
        return {
          name:data.title,
          extract:data.extract.split('.')[0]
        }
      }
      else{
        return null;
      }

    } catch (error) {
      console.error("Error fetching person data:", error);
      return null;
    }
  }

   const performGoogleSearch = (query) =>{
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    window.open(searchUrl,"_blank");

  }

  return (
    <div>
      <div className="voice-assistant">
        <img src={img} alt="AI" className='ai-image' />
        <h2>Voice Assistant (Friday)</h2>

        <button className='btn' onClick={startListening} disabled={isListening}>
          <i className='fas fa-microphone'></i>
          {isListening ? "Listening..." : "Start listening"}

        </button>
        <p className="transcript">{transcript}</p>
        <p className="information">{information}</p>
      </div>
    </div>
  )
}

export default App
