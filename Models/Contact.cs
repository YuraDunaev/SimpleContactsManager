using System.ComponentModel.DataAnnotations;
using ContactsCRUD.Data;

namespace ContactsCRUD.Models;

public class Contact
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Name must be between 2 and 100 characters")]
    [RegularExpression(@"^[a-zA-Zа-яА-ЯёЁ\s\-']+$", ErrorMessage = "Name can only contain letters, spaces, hyphens and apostrophes")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mobile phone is required")]
    [RegularExpression(@"^\+?\d{10,15}$", ErrorMessage = "Mobile phone must be a valid phone number (10-15 digits, optionally starting with +)")]
    [Phone(ErrorMessage = "Invalid phone number format")]
    [UniquePhone]
    public string MobilePhone { get; set; } = string.Empty;

    [StringLength(100, ErrorMessage = "Job title cannot exceed 100 characters")]
    public string? JobTitle { get; set; }

    [Required(ErrorMessage = "Birth date is required")]
    [DataType(DataType.Date)]
    [Display(Name = "Birth Date")]
    [CustomValidation(typeof(Contact), nameof(ValidateBirthDate))]
    public DateTime BirthDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public static ValidationResult? ValidateBirthDate(DateTime birthDate, ValidationContext context)
    {
        if (birthDate > DateTime.Now)
            return new ValidationResult("Birth date cannot be in the future");
        if (birthDate < new DateTime(1900, 1, 1))
            return new ValidationResult("Birth date cannot be earlier than 1900");
        return ValidationResult.Success;
    }
}

public class UniquePhoneAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is not string phone || string.IsNullOrWhiteSpace(phone))
            return ValidationResult.Success;

        var dbContext = validationContext.GetService<AppDbContext>();
        if (dbContext == null)
            return ValidationResult.Success;

        var contact = (Contact)validationContext.ObjectInstance;
        var exists = dbContext.Contacts.Any(c => c.MobilePhone == phone && c.Id != contact.Id);

        if (exists)
            return new ValidationResult("This phone number is already in use by another contact");

        return ValidationResult.Success;
    }
}