-- Migration: Setup default privileges and schema permissions
-- Description: Configure default permissions for future objects
-- Dependencies: Run after all tables are created

-- Grant schema usage permissions
GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

-- Setup default privileges for sequences
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON SEQUENCES TO "service_role";

-- Setup default privileges for functions
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON FUNCTIONS TO "service_role";

-- Setup default privileges for tables
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" 
    GRANT ALL ON TABLES TO "service_role";

-- Reset session settings
RESET ALL;