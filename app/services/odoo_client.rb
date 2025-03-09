require "xmlrpc/client"

class OdooClient
  ODOO_URL = ENV.fetch("ODOO_URL")
  ODOO_DB = ENV.fetch("ODOO_DB")
  ODOO_USER = ENV.fetch("ODOO_USER")
  ODOO_PASSWORD = ENV.fetch("ODOO_PASSWORD")

  def self.authenticate
    server = XMLRPC::Client.new2("#{ODOO_URL}/xmlrpc/2/common")
    uid = server.call("authenticate", ODOO_DB, ODOO_USER, ODOO_PASSWORD, {})

    if uid
      Rails.logger.info "✅ [OdooClient] Autenticazione riuscita! User ID: #{uid}"
      uid
    else
      Rails.logger.error "❌ [OdooClient] Errore di autenticazione!"
      nil
    end
  rescue StandardError => e
    Rails.logger.error "❌ [OdooClient] Errore: #{e.message}"
    nil
  end

  def self.fetch_tasks(odoo_user_id)
    uid = authenticate
    return [] unless uid

    models = XMLRPC::Client.new2("#{ODOO_URL}/xmlrpc/2/object").proxy
    task_ids = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, "project.task", "search", [[["user_ids", "=", odoo_user_id]]])

    if task_ids.empty?
      Rails.logger.info "⚠️ Nessun task trovato per l'utente Odoo #{odoo_user_id}."
      return []
    end

    tasks = models.execute_kw(ODOO_DB, uid, ODOO_PASSWORD, "project.task", "read", [task_ids], { "fields" => ["id", "name", "stage_id", "date_deadline"] })

    Rails.logger.info "📦 [OdooClient] Recuperati #{tasks.length} tasks per l'utente Odoo #{odoo_user_id}."
    tasks
  rescue StandardError => e
    Rails.logger.error "❌ [OdooClient] Errore nel recupero dei tasks: #{e.message}"
    []
  end
end
