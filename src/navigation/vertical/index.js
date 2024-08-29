import adminHub from './admin-hub'
//import charts from './charts'
import dashboard from './dashboard'
import system from './system'
import support from './support'
import transactional from './transactional'

export default [...dashboard, ...adminHub, ...transactional, ...system, ...support]
