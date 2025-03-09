class TasksController < ApplicationController
  def index
    tasks = fetch_tasks_from_odoo

    respond_to do |format|
      format.html # Questo renderizza `app/views/tasks/index.html.erb`
      format.json { render json: tasks.presence || { success: false, error: "Errore nel recupero dei tasks" }, status: tasks.present? ? :ok : :internal_server_error }
    end
  end

  def update
    task_id = params[:id]
    new_status = params[:status]

    if task_id.blank? || new_status.blank?
      render json: { success: false, error: "ID o status mancante" }, status: 400
      return
    end

    updated = update_task_in_odoo(task_id, new_status)

    if updated
      render json: { success: true, id: task_id, status: new_status }
    else
      render json: { success: false, error: "Errore aggiornamento in Odoo" }, status: 422
    end
  end

  private

  def fetch_tasks_from_odoo
    begin
      odoo = OdooClient.new
      user_id = Current.user.odoo_user_id
      tasks = odoo.get_tasks(user_id)

      if tasks.nil? || tasks.empty?
        Rails.logger.warn "⚠️ Nessun task trovato per l'utente #{user_id}"
      end

      tasks
    rescue StandardError => e
      Rails.logger.error "❌ Errore nel recupero dei tasks da Odoo: #{e.message}"
      nil
    end
  end

  def update_task_in_odoo(task_id, new_status)
    begin
      odoo = OdooClient.new

      # Controlliamo se il task esiste prima di aggiornarlo
      task = odoo.get_task(task_id)
      unless task
        Rails.logger.warn "⚠️ Task #{task_id} non trovato in Odoo"
        return false
      end

      result = odoo.update_task(task_id, new_status)
      Rails.logger.info "✅ Task #{task_id} aggiornato con successo in Odoo" if result
      result
    rescue StandardError => e
      Rails.logger.error "❌ Errore aggiornamento task #{task_id}: #{e.message}"
      false
    end
  end
end
