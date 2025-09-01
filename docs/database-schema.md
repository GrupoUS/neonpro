# Database Schema Documentation Guide - Version: 1.0.0

This file contains instructions for organizing and maintaining database schema documentation in a clear and concise way.

## Database Schema Instructions

### File Organization Structure Example

```
docs/database-schema/
├── tables/
│   ├── users.md
│   ├── events.md
│   ├── registrations.md
│   └── [other-tables].md
├── functions.md
├── triggers.md
├── relationships.md
└── enums.md
```

### Required Files

#### 1. Tables Folder (`tables/`)
- **Purpose**: Each table gets its own file
- **Naming**: Use table name as filename (e.g., `users.md`, `events.md`)
- **Content**: Schema, relationships, and RLS policies for that specific table

#### 2. Functions (`functions.md`)
- **Purpose**: Document all custom database functions
- **Content**: Function signatures, parameters, return types, purpose

#### 3. Triggers (`triggers.md`)
- **Purpose**: Document all database triggers
- **Content**: Trigger name, table, event, function called

#### 4. Relationships (`relationships.md`)
- **Purpose**: Document foreign key relationships
- **Content**: Simple list of FK relationships and cascade actions

#### 5. Enums (`enums.md`)
- **Purpose**: Document custom enum types
- **Content**: Enum name and possible values

### How to Document Each Component

#### Table Documentation Template
```markdown
# Table Name

## Schema
| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | uuid | PRIMARY KEY | - | Primary identifier |
| name | text | NOT NULL | - | Display name |

## Relationships
- `other_table.table_id` → `table_name.id`

## Row Level Security (RLS)
**Status**: ✅/❌ **Enabled/Disabled** (Risk level if disabled)

### Current Policies
- Policy name and description (if RLS is enabled)

### Required Policies (if RLS is disabled)
```sql
-- Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "policy_name" ON table_name
  FOR operation USING (condition);
```
```

#### Functions Documentation Template
```markdown
# Database Functions

## Function Name
**Purpose**: What the function does
**Parameters**: Input parameters and types
**Returns**: Return type and description
**Usage**: When and how to use it

```sql
CREATE OR REPLACE FUNCTION function_name(param1 type1)
RETURNS return_type AS $$
-- Function body
$$ LANGUAGE plpgsql;
```
```

#### Triggers Documentation Template
```markdown
# Database Triggers

## Trigger Name
**Table**: Which table the trigger is on
**Event**: INSERT/UPDATE/DELETE
**Timing**: BEFORE/AFTER
**Function**: Which function it calls
**Purpose**: What it accomplishes

```sql
CREATE TRIGGER trigger_name
  AFTER INSERT ON table_name
  FOR EACH ROW
  EXECUTE FUNCTION function_name();
```
```

### Documentation Rules

1. **Keep it Simple**: Only document what currently exists
2. **No Speculation**: Don't include recommendations or future plans
3. **Current State**: Focus on the actual database state
4. **Concise Format**: Use tables and lists, avoid long paragraphs
5. **Consistent Structure**: Follow the templates exactly

### Best Practices

1. **Update Documentation First**: Before making database changes, update the relevant documentation file
2. **Test Changes**: Always test schema changes in development before applying to production
3. **Version Control**: Commit documentation changes with database migrations
4. **Review Security**: Check RLS policies when adding new tables or modifying existing ones
5. **Keep Current**: Remove documentation for deleted tables/functions immediately

### Example Documentation

#### Example Table File (`tables/users.md`)
```markdown
# Users Table

## Schema
| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | text | PRIMARY KEY, NOT NULL | - | Unique user identifier |
| email | text | NOT NULL, UNIQUE | - | User email address |
| name | text | NULL | - | User display name |
| created_at | timestamp | NOT NULL | CURRENT_TIMESTAMP | Record creation time |

## Relationships
- `accounts.user_id` → `users.id` (CASCADE DELETE)
- `events.organizer_id` → `users.id`

## Row Level Security (RLS)
**Status**: ✅ **Enabled** (overly permissive - allows all operations)

### Current Policies
- "Allow all access to users" - Allows all operations for public role

### Recommended Policies
```sql
-- Drop overly permissive policy
DROP POLICY "Allow all access to users" ON users;

-- Users can only access their own profile
CREATE POLICY "Users manage own profile" ON users
  FOR ALL USING (auth.uid()::text = id);
```
```

#### Example Functions File (`functions.md`)
```markdown
# Database Functions

## generate_user_id
**Purpose**: Generate unique user identifier
**Parameters**: None
**Returns**: text
**Usage**: Called automatically on user creation

```sql
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS text AS $$
BEGIN
  RETURN 'usr_' || substr(md5(random()::text), 1, 12);
END;
$$ LANGUAGE plpgsql;
```
```

#### Example Triggers File (`triggers.md`)
```markdown
# Database Triggers

## update_user_timestamp
**Table**: users
**Event**: UPDATE
**Timing**: BEFORE
**Function**: update_timestamp()
**Purpose**: Automatically update updated_at column

```sql
CREATE TRIGGER update_user_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();
```
```

This structure keeps documentation simple, current, and easy to maintain.