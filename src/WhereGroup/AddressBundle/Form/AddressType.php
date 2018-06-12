<?php

namespace WhereGroup\AddressBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;

/**
 * Class AddressType
 * @package WhereGroup\AddressBundle\Form
 */
class AddressType extends AbstractType
{

    /**
     * @param FormBuilderInterface $builder
     * @param array $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {

        $builder
            ->add('uuid', TextType::class, array(
                'label'     => 'ID',
                'required'  => false,
                'attr' => array(
                    'readonly' => true,
                ),
            ))->add('individualName', TextType::class, array(
                'label'    => 'Zuständige Person',
                'required' => false
            ))->add('organisationName', TextType::class, array(
                'label'    => 'Name der Organisation',
                'required' => false
            ))->add('positionName', TextType::class, array(
                'label'    => 'Funktion der Person',
                'required' => false
            ))->add('email', TextareaType::class, array(
                'label'    => 'E-Mail',
                'required' => false
            ))->add('country', ChoiceType::class, array(
                'choices' => array(
                    '' => '',
                    'Deutschland' => 'DE'
                ),
                'label'    => 'Land / Staat',
                'required' => false
            ))->add('administrativeArea', ChoiceType::class, array(
                'choices' => array(
                    ''                       => '',
                    'Baden-Württemberg'      => 'Baden-Württemberg',
                    'Bayern'                 => 'Bayern',
                    'Berlin'                 => 'Berlin',
                    'Brandenburg'            => 'Brandenburg',
                    'Bremen'                 => 'Bremen',
                    'Hamburg'                => 'Hamburg',
                    'Hessen'                 => 'Hessen',
                    'Mecklenburg-Vorpommern' => 'Mecklenburg-Vorpommern',
                    'Niedersachsen'          => 'Niedersachsen',
                    'Nordrhein-Westfalen'    => 'Nordrhein-Westfalen',
                    'Rheinland-Pfalz'        => 'Rheinland-Pfalz',
                    'Saarland'               => 'Saarland',
                    'Sachsen-Anhalt'         => 'Sachsen-Anhalt',
                    'Schleswig-Holstein'     => 'Schleswig-Holstein',
                    'Thüringen'              => 'Thüringen'
                ),
                'label'    => 'Bundesland',
                'required' => false
            ))->add('deliveryPoint', TextType::class, array(
                'label'    => 'Straße und Hausnummer / Postfach',
                'required' => false
            ))->add('city', TextType::class, array(
                'label'    => 'Stadt / Ort',
                'required' => false
            ))->add('postalCode', TextType::class, array(
                'label'    => 'PLZ',
                'required' => false
            ))->add('voice', TextType::class, array(
                'label'    => 'Telefonnummer',
                'required' => false
            ))->add('facsimile', TextType::class, array(
                'label'    => 'Faxnummer',
                'required' => false
            ))->add('url', TextType::class, array(
                'label'    => 'Internetadresse',
                'required' => false
            ))->add('urlDescription', TextareaType::class, array(
                'label'    => 'Beschreibung der Internetadresse',
                'required' => false
            ))->add('hoursOfService', TextareaType::class, array(
                'label'    => 'Erreichbarkeit',
                'required' => false
            ));
    }
}
