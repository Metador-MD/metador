p[dateStamp]
p[hierarchyLevel]
p[serviceLocalName]

metadata
========
p[fileIdentifier]  
p[metadataLanguage]  
p[responsiblePartyMetadata]  
> p[responsiblePartyMetadata][0][organisationName]  
> p[responsiblePartyMetadata][0][electronicMailAddress]
p[browserGraphic]

identification
==============
p[identifier]
> p[identifier][0][code]  
> p[identifier][0][codespace]

p[title]  
p[alternateTitle]
p[abstract]  
p[onlineResource][]  
p[coupledResource][]

classification
==============
p[serviceType]
p[serviceTypeVersion]
p[containsOperationsName]
p[containsOperationsDCP]
p[containsOperationsURL]



keyword
=======
p[keyword]  
> p[keyword][title][value][]  
> p[keyword][title][date]  
> p[keyword][title][type]

geographic
==========
p[bbox]
> p[bbox][0][nLatitude]
> p[bbox][0][eLongitude]
> p[bbox][0][sLatitude]
> p[bbox][0][wLongitude]

temporal
========
p[creationDate]
p[publicationDate]
p[revisionDate]

p[temporalExtent]
> p[temporalExtent][0][begin]
> p[temporalExtent][0][end]

conformity
==========
p[dataquality]
> p[dataquality][0][title]
> p[dataquality][0][date]
> p[dataquality][0][type]
> p[dataquality][0][result]

constraints
===========
p[uselimitation][]
p[otherconstraints][]

responsibleparty
================
p[responsibleParty]
> p[responsibleParty][0][organisationName]
> p[responsibleParty][0][electronicMailAddress]
> p[responsibleParty][0][role]
> p[responsibleParty][0][individualName]
> p[responsibleParty][0][country]
> p[responsibleParty][0][administrativeArea]
> p[responsibleParty][0][deliveryPoint]
> p[responsibleParty][0][city]
> p[responsibleParty][0][postalCode]
> p[responsibleParty][0][voice]
> p[responsibleParty][0][facsimile]
> p[responsibleParty][0][onlineResource]