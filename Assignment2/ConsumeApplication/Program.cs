using System;
using System.Net.Http;
using System.Text;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace ConsumingApplication;

class Program
{
    static async Task Main(string[] args)
    {
        var url = "http://localhost:3000/api";
        var endpoint_GetAllTimesOfDay = "/timesOfDay";
        var endpoint_GetSupportedLanguages = "/languages";

        using (HttpClient client = new HttpClient())
        {
            try
            {
                // Get all the times of day
                HttpResponseMessage timesResponse = await client.GetAsync(url + endpoint_GetAllTimesOfDay);
                timesResponse.EnsureSuccessStatusCode();
                string timesContent = await timesResponse.Content.ReadAsStringAsync();
                
                // Deserialize and extract data
                var timesOfDayResponse = JsonConvert.DeserializeObject<ApiResponse>(timesContent);
                string[] timesOfDay = timesOfDayResponse.Data;

                // Get all the languages
                HttpResponseMessage languagesResponse = await client.GetAsync(url + endpoint_GetSupportedLanguages);
                languagesResponse.EnsureSuccessStatusCode();
                string languagesContent = await languagesResponse.Content.ReadAsStringAsync();

                // Deserialize and extract data
                var languagesResponseObj = JsonConvert.DeserializeObject<ApiResponse>(languagesContent);
                string[] languages = languagesResponseObj.Data;

                // Display available times of day
                Console.WriteLine("Available times of day:");
                foreach (var time in timesOfDay)
                {
                    Console.WriteLine($"- {time}");
                }

                // Display available languages
                Console.WriteLine("\nAvailable languages:");
                foreach (var lang in languages)
                {
                    Console.WriteLine($"- {lang}");
                }

                // Get user input for day and languages
                Console.Write("\nPlease enter one of the times of day: ");
                string selectedTime = Console.ReadLine();

                Console.Write("Please enter one of the languages: ");
                string selectedLanguage = Console.ReadLine();

                // Asking for the tone
                Console.Write("Please enter the tone (Formal/Casual, default is Formal): ");
                string selectedTone = Console.ReadLine();
                if (string.IsNullOrWhiteSpace(selectedTone))
                {
                    selectedTone = "Formal";
                }

                // Prepare the greeting request
                var greetingRequest = new
                {
                    timeOfDay = selectedTime,
                    language = selectedLanguage,
                    tone = selectedTone
                };

                // Send the greeting request
                var greetingContent = new StringContent(JsonConvert.SerializeObject(greetingRequest), Encoding.UTF8, "application/json");
                HttpResponseMessage greetingResponse = await client.PostAsync(url + "/greet", greetingContent);
                greetingResponse.EnsureSuccessStatusCode();
                string greetingResult = await greetingResponse.Content.ReadAsStringAsync();
                var greetingObject = JsonConvert.DeserializeObject<GreetingResponse>(greetingResult);

                // Display the greeting
                Console.WriteLine($"\nGreeting: {greetingObject.GreetingMessage}");
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine($"Error: {e.Message}");
            }
        }
    }
}

public class ApiResponse
{
    [JsonProperty("data")]
    public string[] Data { get; set; }
}

public class GreetingResponse
{
    [JsonProperty("greetingMessage")]
    public string GreetingMessage { get; set; }
}
