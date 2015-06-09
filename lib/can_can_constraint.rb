class CanCanConstraint
  def initialize(action, resource)
    @action = action
    @resource = resource
  end

  def matches?(request)
    if request.env['warden'].user.present?
      current_user = request.env['warden'].user
      ability = Ability.new(current_user)
      return ability.can?(@action, @resource)
    else
      return false
    end
  end
end
