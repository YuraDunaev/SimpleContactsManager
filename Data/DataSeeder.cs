using ContactsCRUD.Models;

namespace ContactsCRUD.Data;

public static class DataSeeder
{
    private static readonly string[] FirstNames =
    [
        "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
        "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
        "Thomas", "Sarah", "Christopher", "Karen", "Charles", "Lisa", "Daniel", "Nancy",
        "Matthew", "Betty", "Anthony", "Margaret", "Mark", "Sandra", "Donald", "Ashley",
        "Steven", "Dorothy", "Andrew", "Kimberly", "Paul", "Emily", "Joshua", "Donna"
    ];

    private static readonly string[] LastNames =
    [
        "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
        "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
        "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
        "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
        "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Adams"
    ];

    private static readonly string[] JobTitles =
    [
        "Software Developer", "Project Manager", "Designer", "Data Analyst",
        "DevOps Engineer", "Product Manager", "UI/UX Designer", "QA Engineer",
        "System Administrator", "Business Analyst", "Technical Writer", "Scrum Master",
        "Frontend Developer", "Backend Developer", "Full Stack Developer", "Database Administrator",
        "Network Engineer", "Security Analyst", "Cloud Architect", "IT Support Specialist"
    ];

    private static readonly string[] CountryCodes =
    [
        "+1", "+7", "+44", "+49", "+33", "+375", "+380", "+48",
        "+86", "+91", "+55", "+81", "+82", "+61", "+39", "+34",
        "+31", "+46", "+41", "+353"
    ];

    private static readonly Random _random = new();

    public static List<Contact> GenerateContacts(int count = 10)
    {
        if (count <= 0)
            return [];

        var contacts = new List<Contact>(count);
        var usedPhones = new HashSet<string>();

        var startDate = new DateTime(2026, 5, 1, 8, 0, 0, DateTimeKind.Utc);
        var endDate = new DateTime(2026, 5, 28, 18, 0, 0, DateTimeKind.Utc);

        for (int i = 1; i <= count; i++)
        {
            var name = $"{FirstNames[_random.Next(FirstNames.Length)]} {LastNames[_random.Next(LastNames.Length)]}";
            var phone = GenerateUniquePhone(usedPhones);
            var jobTitle = JobTitles[_random.Next(JobTitles.Length)];
            var birthDate = GenerateRandomBirthDate();
            var createdAt = GenerateRandomCreatedAt(startDate, endDate);

            contacts.Add(new Contact
            {
                Id = i,
                Name = name,
                MobilePhone = phone,
                JobTitle = jobTitle,
                BirthDate = birthDate,
                CreatedAt = createdAt
            });
        }

        return contacts;
    }

    private static string GenerateUniquePhone(HashSet<string> usedPhones)
    {
        string phone;
        do
        {
            var code = CountryCodes[_random.Next(CountryCodes.Length)];
            var number = _random.Next(100000000, 999999999).ToString();
            phone = $"{code}{number}";
        }
        while (!usedPhones.Add(phone));

        return phone;
    }

    private static DateTime GenerateRandomBirthDate()
    {
        var start = new DateTime(1965, 1, 1);
        var end = new DateTime(2003, 12, 31);
        var range = (end - start).Days;
        return start.AddDays(_random.Next(range));
    }

    private static DateTime GenerateRandomCreatedAt(DateTime start, DateTime end)
    {
        var range = (end - start).TotalSeconds;
        return start.AddSeconds(_random.NextDouble() * range);
    }
}