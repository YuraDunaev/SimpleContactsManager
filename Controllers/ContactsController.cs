using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ContactsCRUD.Data;
using ContactsCRUD.Models;

namespace ContactsCRUD.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ContactsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ContactsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/contacts?page=1&pageSize=10&search=&countryCode=&jobTitle=&sortBy=name&sortDesc=false
    [HttpGet]
    public async Task<ActionResult<object>> GetContacts(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? countryCode = null,
        [FromQuery] string? jobTitle = null,
        [FromQuery] string sortBy = "name",
        [FromQuery] bool sortDesc = false)
    {
        var query = _context.Contacts.AsQueryable();

        // Filter by search (name or phone)
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(c =>
                c.Name.ToLower().Contains(term) ||
                c.MobilePhone.Contains(term));
        }

        // Filter by country code (starts with)
        if (!string.IsNullOrWhiteSpace(countryCode))
        {
            var code = countryCode.Trim();
            query = query.Where(c => c.MobilePhone.StartsWith(code));
        }

        // Filter by job title
        if (!string.IsNullOrWhiteSpace(jobTitle))
        {
            var title = jobTitle.Trim().ToLower();
            query = query.Where(c =>
                c.JobTitle != null && c.JobTitle.ToLower().Contains(title));
        }

        // Sorting
        query = sortBy.ToLower() switch
        {
            "name" => sortDesc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name),
            "phone" or "country" => sortDesc ? query.OrderByDescending(c => c.MobilePhone) : query.OrderBy(c => c.MobilePhone),
            "created" or "createdat" => sortDesc ? query.OrderByDescending(c => c.CreatedAt) : query.OrderBy(c => c.CreatedAt),
            _ => sortDesc ? query.OrderByDescending(c => c.Name) : query.OrderBy(c => c.Name)
        };

        var totalItems = await query.CountAsync();
        var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

        var contacts = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            contacts,
            pagination = new
            {
                currentPage = page,
                pageSize,
                totalItems,
                totalPages,
                hasPrevious = page > 1,
                hasNext = page < totalPages
            }
        });
    }

    // GET: api/contacts/phone-unique?phone=...&excludeId=0
    [HttpGet("phone-unique")]
    public async Task<ActionResult<bool>> IsPhoneUnique(
        [FromQuery] string phone,
        [FromQuery] int excludeId = 0)
    {
        if (string.IsNullOrWhiteSpace(phone))
            return Ok(true);

        var exists = await _context.Contacts
            .AnyAsync(c => c.MobilePhone == phone && c.Id != excludeId);

        return Ok(!exists);
    }

    // GET: api/contacts/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Contact>> GetContact(int id)
    {
        var contact = await _context.Contacts.FindAsync(id);
        if (contact == null)
            return NotFound();
        return contact;
    }

    // POST: api/contacts
    [HttpPost]
    public async Task<ActionResult<Contact>> CreateContact([FromBody] Contact contact)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Check unique phone
        if (await _context.Contacts.AnyAsync(c => c.MobilePhone == contact.MobilePhone))
            return BadRequest(new { message = "This phone number is already in use by another contact" });

        contact.CreatedAt = DateTime.UtcNow;
        _context.Contacts.Add(contact);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetContact), new { id = contact.Id }, contact);
    }

    // PUT: api/contacts/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateContact(int id, [FromBody] Contact contact)
    {
        if (id != contact.Id)
            return BadRequest("Contact ID mismatch");

        // Check unique phone excluding current contact
        if (await _context.Contacts.AnyAsync(c => c.MobilePhone == contact.MobilePhone && c.Id != id))
            return BadRequest(new { message = "This phone number is already in use by another contact" });

        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Preserve original CreatedAt
        var existing = await _context.Contacts.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (existing != null)
            contact.CreatedAt = existing.CreatedAt;

        _context.Entry(contact).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Contacts.Any(e => e.Id == id))
                return NotFound();
            throw;
        }

        return NoContent();
    }

    // DELETE: api/contacts/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteContact(int id)
    {
        var contact = await _context.Contacts.FindAsync(id);
        if (contact == null)
            return NotFound();

        _context.Contacts.Remove(contact);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}