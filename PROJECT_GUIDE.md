# Project Tracker — Full Technical Walkthrough

*A complete explanation of what you built, the tools involved, and how every request flows through the system. Written for interview prep — read top to bottom once, then use it as a reference.*

---

## 1. What This Project Is

A **Project Tracker** web application where a logged-in admin can:
- Create, edit, and delete **Employees** (a shared pool of people)
- Create, edit, and delete **Projects** (each with a start date, end date, status, and one Project Manager)
- Assign/remove Employees to/from a Project's team (many-to-many relationship)
- Log in securely — every API call requires a valid login token

It's a classic **three-tier architecture**:

```
┌─────────────┐        HTTP/JSON        ┌──────────────┐        SQL        ┌───────────┐
│   React     │  ─────────────────────► │ Spring Boot  │ ────────────────► │  MySQL    │
│  (frontend) │  ◄───────────────────── │  (backend)   │ ◄──────────────── │(database) │
└─────────────┘                          └──────────────┘                    └───────────┘
   Runs in the        Runs on your          Runs on your
   browser at           computer at           computer at
  localhost:3000       localhost:8080        localhost:3306
```

**Why three tiers?** Each layer has one job, and they don't need to know the details of the others. React doesn't know or care that MySQL exists — it only talks to Spring Boot's API. Spring Boot doesn't know or care that React exists — it just receives HTTP requests and returns JSON. This separation is *the* standard pattern behind almost all modern web apps (not just this one — think Gmail, Instagram, your banking app).

---

## 2. The Full Tech Stack, and What Each Piece Is For

| Tool | Category | What it actually does | Why we needed it |
|---|---|---|---|
| **Java** | Language | The programming language the backend is written in | Backend logic needs a language to run in |
| **Maven** | Build tool | Downloads libraries, compiles code, packages the app | Manages all our dependencies (see section 3) |
| **Spring Boot** | Framework | A huge toolkit built on top of Java that handles web servers, routing, dependency wiring, etc. | Writing a web server from scratch in raw Java would take thousands of lines; Spring Boot gives it to us |
| **Spring Web (MVC)** | Spring module | Lets us define REST API endpoints (`@GetMapping`, `@PostMapping`, etc.) | This is how React and the backend talk — via HTTP endpoints |
| **Spring Data JPA** | Spring module | Lets Java classes represent database tables, without writing raw SQL | So `Employee.java` = `employees` table, automatically |
| **Hibernate** | ORM (Object-Relational Mapper) | The actual engine underneath JPA that translates Java objects into SQL | JPA is a *specification* (a set of rules); Hibernate is the tool that actually implements it |
| **MySQL** | Database | Stores all the actual data permanently on disk | So data survives even after you close the app |
| **Spring Security** | Spring module | Protects endpoints, requiring a valid login | So random people on the internet can't hit your API |
| **JWT (JSON Web Token)** | Security concept | A signed, tamper-proof "ID card" issued after login | Lets the backend verify who's making a request without storing session data |
| **Lombok** | Code-generation library | Auto-writes getters/setters/constructors for us | Saves writing repetitive boilerplate in every entity class |
| **React** | Frontend library | Builds the user interface as reusable components | So the UI updates instantly without full page reloads |
| **React Router** | Frontend library | Lets React have multiple "pages" (Login, Projects, Employees) | React by default is a single page — this gives it multi-page navigation |
| **Axios** | Frontend library | Makes HTTP requests from React to the backend | Fetches/sends JSON data to Spring Boot's API |
| **Vite** | Frontend build tool | Runs a fast local dev server for React, bundles the app | Similar role to Maven, but for the frontend |

---

## 3. What Is Maven, Exactly?

Think of Maven as **npm, but for Java**. If you've heard of `npm install` for JavaScript — Maven does the same job for Java projects.

**The problem Maven solves:** Spring Boot, Hibernate, JWT libraries, etc. are all separate pieces of code written by other people. You can't just `import` them if they're not on your computer. Maven:

1. Reads your `pom.xml` file (a shopping list of dependencies)
2. Downloads each one (and anything *they* depend on) from the internet (a repository called Maven Central)
3. Puts them all on your project's "classpath" so your code can use them
4. Compiles your Java code
5. Packages everything into one runnable file (a `.jar`)

**Your `pom.xml`, decoded:**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```
This single entry actually pulls in dozens of libraries under the hood — an embedded web server (Tomcat), JSON conversion (Jackson), and more. That's why it's called a "starter" — it's a bundle, not a single library.

**Key interview point:** *"Maven manages dependencies and builds the project — it's what turns your source code plus a list of libraries into a runnable application, without you manually downloading .jar files yourself."*

---

## 4. What Is Spring Boot, Exactly?

Spring Boot is built on top of a much older framework called **Spring Framework**. Spring Framework's core idea is called **Dependency Injection (DI)** / **Inversion of Control (IoC)**.

### The core idea: Dependency Injection

Normally in code, if class A needs class B, A creates B itself:
```java
class EmployeeController {
    EmployeeService service = new EmployeeService(); // A creates B itself
}
```

With Spring, you never write `new` for your own classes. Instead, you just declare "I need one of these" and Spring hands it to you:
```java
class EmployeeController {
    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) { // Spring "injects" it
        this.employeeService = employeeService;
    }
}
```

**Why does this matter?** It means classes don't need to know *how* to build their dependencies — just that they need them. This makes code far easier to test, swap out, and reason about. Spring keeps a giant registry of every object it manages (called the **ApplicationContext**), and wires them together automatically based on annotations.

### The annotations you used, decoded

| Annotation | Meaning |
|---|---|
| `@SpringBootApplication` | "This is the starting point — scan this whole package for Spring components and wire them together" |
| `@RestController` | "This class handles HTTP requests and returns JSON (not an HTML page)" |
| `@Service` | "This class holds business logic" |
| `@Repository` | "This class talks to the database" |
| `@Entity` | "This class represents a database table" |
| `@Autowired` (implicit via constructor) | "Spring, please give me an instance of this — I don't want to build it myself" |
| `@Component` | Generic version of the above — "Spring, manage this class for me" |

**Key interview point:** *"Spring Boot auto-configures a production-ready application with minimal setup — it starts an embedded server, wires all your classes together via dependency injection, and lets you focus on business logic instead of plumbing."*

---

## 5. The Backend, Layer by Layer

Your backend follows a very standard 4-layer pattern. Here's what each layer does and why it exists:

```
Controller  →  Service  →  Repository  →  Database
(the "door")   (the "brain") (the "hands")
```

### Layer 1: Model / Entity (`model/Employee.java`, `model/Project.java`)
Defines the *shape* of your data, and maps it directly to a database table.
```java
@Entity
@Table(name = "employees")
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    ...
}
```
- `@Entity` tells Hibernate "this class = a table"
- `@Id` marks the primary key
- `@GeneratedValue(strategy = GenerationType.IDENTITY)` means MySQL auto-increments the id (1, 2, 3...)
- Because `spring.jpa.hibernate.ddl-auto=update` is set in `application.properties`, Hibernate literally reads this class and creates/updates the matching MySQL table for you — you never wrote a `CREATE TABLE` statement.

### Layer 2: Repository (`repository/EmployeeRepository.java`)
```java
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
}
```
This is one of the most "magic-feeling" parts of Spring Data JPA. You wrote **zero implementation**, yet this interface gives you `save()`, `findAll()`, `findById()`, `deleteById()`, and more — all fully working, for free. Spring generates the actual implementation at runtime, translating each method into SQL behind the scenes (e.g. `findAll()` → `SELECT * FROM employees`).

### Layer 3: Service (`service/EmployeeService.java`, `service/ProjectService.java`)
This is where **business logic** lives — anything that's more than "just talk to the database." For example, in `ProjectService`, when adding an employee to a project, we check whether they're already assigned before adding them again:
```java
boolean alreadyAssigned = project.getEmployees().stream()
        .anyMatch(e -> e.getId().equals(employee.getId()));
if (!alreadyAssigned) {
    project.getEmployees().add(employee);
    projectRepository.save(project);
}
```
**Why not put this logic directly in the controller?** Separation of concerns — the controller's job is *only* to handle HTTP (reading requests, returning responses). If business logic lived there, you couldn't reuse it elsewhere (e.g. from a scheduled job, or a CLI tool) without duplicating it.

### Layer 4: Controller (`controller/EmployeeController.java`, `controller/ProjectController.java`)
This is the **only layer that knows about HTTP**. It defines URLs and maps them to service calls:
```java
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@Valid @RequestBody Employee employee) {
        ...
    }
}
```
- `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` map directly to HTTP methods (GET/POST/PUT/DELETE) — this is what makes it a **REST API**
- `@RequestBody` tells Spring "parse the incoming JSON into this Java object automatically"
- `@Valid` triggers the validation rules you set on the Employee class (like `@NotBlank`, `@Email`) — if they fail, Spring throws an exception which your `GlobalExceptionHandler` catches and turns into a clean JSON error

**Key interview point:** *"I used a layered architecture — Controller for HTTP handling, Service for business logic, Repository for data access. This keeps each layer focused on one responsibility and makes the code easier to test and maintain."*

---

## 6. Understanding the Database Relationships

This project has two relationship types — a very common interview topic.

### One-to-Many: Project → Project Manager
```java
@ManyToOne
@JoinColumn(name = "project_manager_id")
private Employee projectManager;
```
One Employee can be the manager of many Projects, but each Project has exactly one manager. In the database, this becomes a `project_manager_id` column on the `projects` table pointing to a row in `employees` — a classic **foreign key**.

### Many-to-Many: Project ↔ Employees (team members)
```java
@ManyToMany
@JoinTable(
    name = "project_employees",
    joinColumns = @JoinColumn(name = "project_id"),
    inverseJoinColumns = @JoinColumn(name = "employee_id")
)
private List<Employee> employees;
```
One Project can have many Employees, and one Employee can be on many Projects. This can't be represented with a single foreign key — it needs a **join table** (`project_employees`) with two columns: `project_id` and `employee_id`. Each row in that table represents one "this employee is on this project" fact. Hibernate created and manages this table automatically — you never had to write it yourself.

**Key interview point:** *"A many-to-many relationship requires a join table because neither side can hold a single foreign key to the other — an employee can belong to multiple projects and vice versa, so we need a separate table recording each pairing."*

---

## 7. Authentication: How Login Actually Works (JWT Flow)

This is one of the most commonly asked topics in interviews, so let's go slow.

### The problem
HTTP is **stateless** — the server doesn't remember you between requests. If you log in on request #1, by request #2 the server has already "forgotten" you unless you prove who you are again.

### Old solution: Sessions
Traditionally, servers solved this by creating a "session" stored in server memory/database, and giving the browser a cookie with a session ID. Every request, the browser sends the cookie, server looks up the session. Downside: server has to store and manage session state for every logged-in user.

### Modern solution: JWT (what you used)
A JWT is a signed token that **contains its own proof of validity** — the server doesn't need to store anything about it. It's like a wax-sealed letter: anyone can read it, but only the server (who has the secret key) can verify the seal wasn't forged.

### Step-by-step: what happens when you log in

1. **You submit** username/password on the Login page (React)
2. **React sends** `POST /api/auth/login` with `{ username, password }` (this endpoint is `permitAll()` in `SecurityConfig` — no token needed yet, since you don't have one)
3. **AuthController** looks up the user in the `users` table, and checks the password:
   ```java
   if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
       throw new BadCredentialsException(...);
   }
   ```
   Note: the stored password is a **BCrypt hash**, never plain text. `matches()` hashes your typed password the same way and compares hashes — the original password is never stored or recoverable, even by you.
4. **If correct**, `JwtUtil.generateToken(username)` creates a signed token containing the username and an expiry time (8 hours), signed with a secret key only the server knows.
5. **React receives** `{ token: "eyJhbGc...", username: "admin" }` and stores the token in `localStorage`.
6. **Every future request** (e.g. "get all projects"), Axios's interceptor automatically attaches:
   ```
   Authorization: Bearer eyJhbGc...
   ```
7. **On the backend**, `JwtAuthFilter` runs on *every single request* before it reaches any controller. It:
   - Reads the `Authorization` header
   - Verifies the token's signature (proves it wasn't tampered with, and was really issued by this server)
   - If valid, tells Spring Security "this request is authenticated" for the rest of the request
8. **If the token is missing or invalid**, Spring Security's `SecurityFilterChain` blocks the request with a 401 Unauthorized — the controller code never even runs.

```
Login Request                          Every Subsequent Request
─────────────                          ─────────────────────────
React ──POST /auth/login──► Backend    React ──GET /projects──► Backend
                                              (Authorization:
       ◄──── { token } ─────                  Bearer <token>)
React stores token                                    │
in localStorage                                        ▼
                                              JwtAuthFilter checks
                                              token signature
                                                        │
                                              valid? ──► Controller runs
                                              invalid? ─► 401 Unauthorized
```

**Key interview point:** *"JWT lets the server verify a user's identity without storing session state — the token is self-contained and cryptographically signed, so the server just verifies the signature on each request instead of doing a database lookup for a session."*

---

## 8. Full Request Trace: "Add Employee to Project"

Let's trace one real action through *every* layer, so you can explain the whole system end-to-end in an interview.

**You click "Add to project" after picking an employee from the dropdown.**

1. **React (`ProjectDetailPage.jsx`)**: `handleAddEmployee()` runs, calling:
   ```js
   addEmployeeToProject(id, selectedEmployeeId)
   ```
2. **`projectService.js`**: this calls Axios:
   ```js
   axiosClient.post(`/projects/${projectId}/employees/${employeeId}`)
   ```
3. **Axios interceptor (`axiosClient.js`)**: automatically attaches your saved JWT token to the `Authorization` header before the request leaves the browser.
4. **Request travels over HTTP** to `http://localhost:8080/api/projects/3/employees/7` (a `POST` with no body needed — both IDs are in the URL)
5. **`JwtAuthFilter`** (backend) intercepts it first, validates the token, marks the request as authenticated.
6. **`SecurityFilterChain`** confirms this route requires authentication (all routes except `/api/auth/**` do) — since the token was valid, the request is allowed through.
7. **`ProjectController.addEmployee()`** receives the request, extracts `id=3` and `employeeId=7` from the URL path, and calls:
   ```java
   projectService.addEmployeeToProject(3L, 7L);
   ```
8. **`ProjectService.addEmployeeToProject()`**:
   - Calls `ProjectRepository.findById(3)` → Spring Data JPA generates SQL: `SELECT * FROM projects WHERE id = 3`
   - Calls `EmployeeRepository.findById(7)` → `SELECT * FROM employees WHERE id = 7`
   - Checks if employee 7 is already in the project's team list
   - If not, adds them to the in-memory list, then calls `projectRepository.save(project)`
9. **Hibernate** sees the `employees` list changed, and generates the SQL to insert a new row into the join table:
   ```sql
   INSERT INTO project_employees (project_id, employee_id) VALUES (3, 7)
   ```
10. **MySQL** executes it and persists the row to disk.
11. **The updated Project object** (now including employee 7 in its list) flows back up: Repository → Service → Controller.
12. **`ProjectController`** wraps it in a `200 OK` response, Spring auto-converts the Java object to JSON (via Jackson, bundled in `spring-boot-starter-web`).
13. **React receives** the JSON response, and `loadData()` re-fetches the project to refresh the UI — the new team member now appears in the table.

That's the entire round trip — browser click to database row to updated screen.

---

## 9. The Frontend Explained

### Why React, and what a "component" is
React lets you break the UI into reusable, self-contained pieces. `EmployeeForm`, `EmployeeList`, `ProjectCard` are each just JavaScript functions that return what should appear on screen (JSX — HTML-like syntax inside JS). When data changes (`useState`), React automatically re-renders only the parts of the screen that need to change — you never manually touch the DOM.

### `useState` and `useEffect`, the two hooks you used constantly
```js
const [employees, setEmployees] = useState([])

useEffect(() => {
  fetchEmployees()
}, [])
```
- `useState([])` creates a piece of memory React tracks — when you call `setEmployees(...)`, React automatically re-renders anything using `employees`.
- `useEffect(fn, [])` runs `fn` once, right after the component first appears on screen (the empty `[]` means "don't re-run this unless something in this list changes" — here, nothing does, so it only runs once, like an `onLoad`).

### React Router — how you get multiple "pages" in a single-page app
Normally a React app is *one* HTML page. React Router intercepts URL changes and swaps out which component renders, without an actual page reload:
```jsx
<Routes>
  <Route path="/" element={<ProjectsPage />} />
  <Route path="/projects/:id" element={<ProjectDetailPage />} />
</Routes>
```
`:id` is a **URL parameter** — in `ProjectDetailPage`, `useParams()` reads it back out to know *which* project to fetch.

### Context (`AuthContext.jsx`) — sharing login state everywhere
Passing the logged-in username down through every single component as a prop would be tedious. Context lets any component, anywhere in the tree, access shared state directly:
```js
const { username, logout } = useAuth()
```
This is how `Navbar` knows who's logged in, and how `ProtectedRoute` knows whether to redirect to `/login`.

---

## 10. Likely Interview Questions (with short answers you can expand on)

**Q: What is REST, and is your API RESTful?**
A: REST means resources are represented by URLs, and HTTP methods indicate the action: GET (read), POST (create), PUT (update), DELETE (remove). Yes — `/api/employees` follows this exactly.

**Q: What's the difference between `@Component`, `@Service`, and `@Repository`?**
A: Functionally almost identical (all register the class with Spring). They exist for *readability/intent* — `@Service` signals business logic, `@Repository` signals data access, and `@Repository` also enables automatic translation of database exceptions into Spring's own exception types.

**Q: Why use DTOs instead of returning your Entity directly?**
A: (Note: your `Project`/`Employee` GET endpoints currently return entities directly, but you *do* use a DTO — `ProjectRequest` — for incoming data.) DTOs decouple your API shape from your database schema, so you can change your database structure without breaking every client, and avoid exposing internal fields you don't want public.

**Q: What is Hibernate actually doing under the hood?**
A: It's an ORM — it converts Java method calls (`repository.save(employee)`) into raw SQL (`INSERT INTO employees...`), and converts SQL result rows back into Java objects. This is called Object-Relational Mapping.

**Q: What happens if two people try to update the same project at the same time?**
A: (Honest answer, good to know the limitation) In its current form, "last write wins" — whichever save happens last overwrites the other silently. Production systems often add optimistic locking (`@Version` field) to detect and prevent this.

**Q: Why JWT instead of sessions?**
A: JWT is stateless — no server-side storage needed per login, which makes it easier to scale across multiple servers (any server can verify the token without shared session storage).

**Q: What's the role of `application.properties`?**
A: External configuration — database URL, credentials, server port, Hibernate behavior — kept separate from code so you can change environments (dev/test/production) without recompiling.

**Q: Explain `spring.jpa.hibernate.ddl-auto=update`**
A: Tells Hibernate to automatically create or alter database tables to match your `@Entity` classes on startup. Great for development speed; in real production systems, this is usually turned off in favor of controlled migration tools (like Flyway or Liquibase), since auto-altering a live production database is risky.

**Q: What is CORS, and why did you need to configure it?**
A: Browsers block a webpage from one origin (`localhost:3000`) from calling an API on a different origin (`localhost:8080`) unless the server explicitly allows it. `CorsConfig.java` tells the backend "requests from `localhost:3000` are allowed."

---

## 11. Glossary (quick lookup)

| Term | One-line meaning |
|---|---|
| **API** | A defined way for two programs to talk to each other (here, HTTP + JSON) |
| **REST** | An API style using URLs as resources and HTTP methods as actions |
| **JSON** | A lightweight text format for structured data — what your API sends/receives |
| **ORM** | A tool that maps database tables to programming language objects |
| **DI (Dependency Injection)** | Objects receive their dependencies from outside, rather than creating them |
| **DTO** | A plain object shaped specifically for a request/response, separate from your database entity |
| **Entity** | A Java class mapped directly to a database table |
| **Endpoint** | A specific URL + HTTP method your API responds to |
| **Middleware/Filter** | Code that runs on every request before it reaches your actual logic (e.g. `JwtAuthFilter`) |
| **Token** | A piece of data proving identity/authorization, sent with each request |
| **Hashing** | One-way scrambling of data (like a password) that can be verified but not reversed |

---

## How to talk about this project in an interview (one paragraph you can adapt)

> "I built a full-stack project management tool using React on the frontend and Spring Boot on the backend, with MySQL for persistence. The backend follows a layered architecture — controllers handle HTTP requests, services contain business logic, and repositories handle data access via Spring Data JPA. I modeled a many-to-many relationship between Projects and Employees using a join table, and a many-to-one relationship for the project manager. Authentication is handled with JWT — users log in once, receive a signed token, and that token is validated on every subsequent request by a custom security filter, rather than relying on server-side sessions. On the frontend, I used React Router for multi-page navigation and Context for sharing authentication state across components."

That's a strong, accurate 30-second answer to "walk me through a project you built."
