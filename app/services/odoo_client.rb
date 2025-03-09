require "xmlrpc/client"

class OdooClient
  ODOO_URL = ENV["ODOO_URL"]
  ODOO_DB = ENV["ODOO_DB"]
  ODOO_USER = ENV["ODOO_USER"]
  ODOO_PASSWORD = ENV["ODOO_PASSWORD"]

  def initialize
    @common = XMLRPC::Client.new2("#{ODOO_URL}/xmlrpc/2/common").proxy
    @uid = @common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASSWORD, {})

    @models = XMLRPC::Client.new2("#{ODOO_URL}/xmlrpc/2/object").proxy
  end

  def get_tasks(user_id)
    @models.execute_kw(
      ODOO_DB, @uid, ODOO_PASSWORD,
      "project.task", "search_read",
      [[["user_ids", "=", user_id]]],  # Filtro per assegnatario
      { "fields" => ["id", "name", "stage_id", "date_deadline"] }
    )
  end
end
