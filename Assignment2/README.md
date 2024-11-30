//for times of day
http://localhost:3000/api/timesOfDay

{
    "message": "success",
    "data": [
        "Morning",
        "Afternoon",
        "Evening"
    ]
}

//for languages
http://localhost:3000/api/languages
{
    "message": "success",
    "data": [
        "English",
        "French",
        "Spanish"
    ]
}

//for greet
request 
{
  "timeOfDay": "Morning",
  "language": "English",
  "tone": "Formal"
}


response 
{
    "greetingMessage": "Good Morning"
}

github link 
[text](https://github.com/Sayed5zan/distribution.git)