import pymssql
import os

class Database:
    """
    Handles connection to the Azure SQL database.
    Connection details are hardcoded in this file.
    """
    def __init__(self):
        # --- Database connection details are set directly here ---
        self.server = "flight-sql-server-123.database.windows.net"
        self.user = "sqladmin@flight-sql-server-123"
        self.password = "Yuvan2004."
        self.database = "flightdb"
        self.connection = None

    def get_connection(self):
        """Establishes or returns the existing database connection."""
        if self.connection is None:
            try:
                # The connection is established using the hardcoded details above
                self.connection = pymssql.connect(
                    server=self.server,
                    user=self.user,
                    password=self.password,
                    database=self.database
                )
            except pymssql.exceptions.OperationalError as e:
                print(f"DATABASE CONNECTION FAILED: {e}")
                # Re-raise the exception to be handled by the application
                raise
        return self.connection

    def close_connection(self):
        """Closes the database connection if it exists."""
        if self.connection:
            self.connection.close()
            self.connection = None

    def execute_query(self, query, params=None, fetchone=False):
        """Executes a SQL query and returns the results."""
        conn = self.get_connection()
        try:
            with conn.cursor(as_dict=True) as cursor:
                cursor.execute(query, params or ())
                if fetchone:
                    result = cursor.fetchone()
                else:
                    result = cursor.fetchall()
                
                # Queries that modify data (INSERT, UPDATE, DELETE) need to be committed
                if query.strip().upper().startswith(('INSERT', 'UPDATE', 'DELETE')):
                    conn.commit()
                return result
        except Exception as e:
            print(f"QUERY FAILED: {e}")
            # Rollback the transaction in case of an error
            conn.rollback()
            raise

